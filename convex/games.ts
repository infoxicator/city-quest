import { mutation } from './_generated/server'

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

export const createGame = mutation({
  args: {
    playerName: v.string(),
    adventureType: v.union(
      v.literal('tour'),
      v.literal('foodie'),
      v.literal('race'),
    ),
    avatarDataUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert('games', {
      playerName: args.playerName,
      adventureType: args.adventureType,
      avatarDataUrl: args.avatarDataUrl,
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
