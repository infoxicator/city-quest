import { mutation, query } from './_generated/server'

import { v } from 'convex/values'

import type { Doc, Id } from './_generated/dataModel'

type AdventureType = 'tour' | 'foodie' | 'race'

const ADVENTURE_FLAVORS: Record<AdventureType, string> = {
  tour:
    'Chart the crystalline avenues of Skyhollow, guiding weary travelers across levitating bridges and whispering atriums.',
  foodie:
    'Track the ember-lit food stalls of Spice Harbor, tasting enchanted dishes to learn their stories and unlock hidden routes.',
  race:
    'Sprint through the Windspindle circuits, a maze of rooftop raceways where griffin-mounted couriers test your reflexes.',
}

export const ADVENTURE_BADGES: Record<AdventureType, string[]> = {
  tour: [
    'Skyline Scout',
    'Bridge Walker',
    'Atrium Explorer',
    'Crystal Navigator',
    'Skyhollow Master',
  ],
  foodie: [
    'Spice Taster',
    'Stall Hunter',
    'Flavor Seeker',
    'Harbor Gourmet',
    'Culinary Legend',
  ],
  race: [
    'Wind Runner',
    'Circuit Racer',
    'Griffin Rider',
    'Speed Demon',
    'Champion Courier',
  ],
}

export function getAvailableBadges(adventureType: AdventureType): string[] {
  return ADVENTURE_BADGES[adventureType] || []
}

export const createGame = mutation({
  args: {
    playerName: v.string(),
    adventureType: v.union(
      v.literal('tour'),
      v.literal('foodie'),
      v.literal('race'),
    ),
    avatarDataUrl: v.optional(v.string()),
    location: v.string(),
    characterCardUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert('games', {
      playerName: args.playerName,
      adventureType: args.adventureType,
      avatarDataUrl: args.avatarDataUrl,
      location: args.location,
      characterCardUrl: args.characterCardUrl,
      createdAt: Date.now(),
    })

    return gameId
  },
})

export const sendPrompt = mutation({
  args: {
    gameId: v.id('games'),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId)

    if (!game) {
      throw new Error('Game not found')
    }

    const prompt = buildCityQuestPrompt(game)

    await ctx.db.patch(args.gameId, {
      welcomePrompt: prompt,
      lastPromptAt: Date.now(),
    })

    return { prompt }
  },
})

export const addPicture = mutation({
  args: {
    gameId: v.id('games'),
    imageUrl: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pictureId = await ctx.db.insert('pictures', {
      gameId: args.gameId,
      imageUrl: args.imageUrl,
      location: args.location,
      description: args.description,
      createdAt: Date.now(),
    })

    return pictureId
  },
})

export const getPlayerProgress = query({
  args: {
    gameId: v.id('games'),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query('playerProgress')
      .withIndex('gameId', (q) => q.eq('gameId', args.gameId))
      .first()

    const game = await ctx.db.get(args.gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (!progress) {
      return {
        level: 0,
        gold: 0,
        badges: [],
        adventureType: game.adventureType,
        playerName: game.playerName,
      }
    }

    return {
      level: progress.level,
      gold: progress.gold,
      badges: progress.badges,
      adventureType: progress.adventureType,
      playerName: game.playerName,
    }
  },
})

export const updatePlayerProgress = mutation({
  args: {
    gameId: v.id('games'),
    level: v.optional(v.number()),
    gold: v.optional(v.number()),
    badge: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    const adventureType = game.adventureType as AdventureType
    const availableBadges = getAvailableBadges(adventureType)

    if (args.badge && !availableBadges.includes(args.badge)) {
      throw new Error(
        `Invalid badge "${args.badge}" for adventure type "${adventureType}". Available badges: ${availableBadges.join(', ')}`,
      )
    }

    let progress = await ctx.db
      .query('playerProgress')
      .withIndex('gameId', (q) => q.eq('gameId', args.gameId))
      .first()

    const now = Date.now()

    if (!progress) {
      const progressId = await ctx.db.insert('playerProgress', {
        gameId: args.gameId,
        level: args.level ?? 0,
        gold: args.gold ?? 0,
        badges: args.badge ? [args.badge] : [],
        adventureType,
        updatedAt: now,
      })
      progress = await ctx.db.get(progressId)
    } else {
      const newLevel = args.level !== undefined ? progress.level + args.level : progress.level
      const newGold = args.gold !== undefined ? progress.gold + args.gold : progress.gold
      const newBadges = args.badge
        ? progress.badges.includes(args.badge)
          ? progress.badges
          : [...progress.badges, args.badge]
        : progress.badges

      await ctx.db.patch(progress._id, {
        level: newLevel,
        gold: newGold,
        badges: newBadges,
        updatedAt: now,
      })

      progress = await ctx.db.get(progress._id)
    }

    if (!progress) {
      throw new Error('Failed to create or update progress')
    }

    const updatedGame = await ctx.db.get(args.gameId)
    return {
      level: progress.level,
      gold: progress.gold,
      badges: progress.badges,
      adventureType: progress.adventureType,
      playerName: updatedGame?.playerName || '',
    }
  },
})

function buildCityQuestPrompt(game: Doc<'games'>) {
  const pathFlavor =
    ADVENTURE_FLAVORS[game.adventureType as AdventureType] ??
    ADVENTURE_FLAVORS.tour

  return [
    `Guild Dispatch: ${game.playerName}`,
    '',
    `The CityQuest council inscribes your name upon the Luminous Ledger.`,
    `${pathFlavor}`,
    'Gather your keepsakes, steady your courage, and report your discoveries at the next moonrise.',
  ].join('\n')
}
