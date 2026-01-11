'use client'

import { motion } from 'framer-motion'
import { PlayButton } from './PlayButton'
import { VolumeControl } from './VolumeControl'
import { TimeDisplay } from './TimeDisplay'
import { ProgressBar } from './ProgressBar'
import { SpeedControl } from './SpeedControl'
import { LoopButton } from './LoopButton'
import { ScreenshotButton } from './ScreenshotButton'
import { PiPButton } from './PiPButton'
import { FullscreenButton } from './FullscreenButton'

export function ControlBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-2"
    >
      {/* Progress Bar */}
      <ProgressBar />

      {/* Controls Row */}
      <div className="flex items-center justify-between px-2">
        {/* Left Controls */}
        <div className="flex items-center">
          <PlayButton />
          <VolumeControl />
          <TimeDisplay />
        </div>

        {/* Right Controls */}
        <div className="flex items-center">
          <SpeedControl />
          <LoopButton />
          <ScreenshotButton />
          <PiPButton />
          <FullscreenButton />
        </div>
      </div>
    </motion.div>
  )
}
