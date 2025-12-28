// scripts/sourceStoryBatch/run.ts

import { loadSourceStoriesFromTSV } from "./loadSourceStoriesFromTSV.js"
import { buildSourceStories } from "./build"

function run() {
  const stories = loadSourceStoriesFromTSV()
  buildSourceStories(stories)
}

run()