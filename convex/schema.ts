import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  games: defineTable({
    playerName: v.string(),
    adventureType: v.union(
      v.literal('tour'),
      v.literal('foodie'),
      v.literal('race'),
      v.literal('kitze'),
    ),
    avatarDataUrl: v.optional(v.string()),
    location: v.string(),
    characterCardUrl: v.optional(v.string()),
    createdAt: v.number(),
    welcomePrompt: v.optional(v.string()),
    lastPromptAt: v.optional(v.number()),
  }),
  pictures: defineTable({
    gameId: v.id('games'),
    imageUrl: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index('gameId', ['gameId']),
  playerProgress: defineTable({
    gameId: v.id('games'),
    level: v.number(),
    gold: v.number(),
    badges: v.array(v.string()),
    adventureType: v.union(
      v.literal('tour'),
      v.literal('foodie'),
      v.literal('race'),
      v.literal('kitze'),
    ),
    updatedAt: v.number(),
  }).index('gameId', ['gameId']),
  stories: defineTable({
    gameId: v.id('games'),
    title: v.string(),
    date: v.string(),
    mainImage: v.optional(v.string()),
    slides: v.array(
      v.object({
        image: v.string(),
        text: v.string(),
      }),
    ),
    createdAt: v.number(),
  }).index('gameId', ['gameId']),
})
