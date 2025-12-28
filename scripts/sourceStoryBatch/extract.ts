// scripts/sourceStoryBatch/extract.ts

import { SourceStory } from "@/data/sourceStories"

const MIN_TEXT_LENGTH = 300
const MIN_FUNCTIONS = 3
const MAX_FUNCTIONS = 6

function validateStories(stories: SourceStory[]): SourceStory[] {
  const seenIds = new Set<string>()

  return stories.filter(story => {
    if (!story.text || story.text.length < MIN_TEXT_LENGTH) return false

    if (
      !story.structural_functions ||
      story.structural_functions.length < MIN_FUNCTIONS ||
      story.structural_functions.length > MAX_FUNCTIONS
    ) {
      return false
    }

    if (seenIds.has(story.id)) return false
    seenIds.add(story.id)

    return true
  })
}

