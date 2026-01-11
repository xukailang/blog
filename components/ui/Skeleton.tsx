'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-cyber-dark/50 border border-cyber-cyan/10',
        className
      )}
    />
  )
}

// Post Card Skeleton
export function PostCardSkeleton() {
  return (
    <div className="rounded-lg border border-cyber-cyan/20 bg-cyber-dark/30 overflow-hidden">
      {/* Cover Image */}
      <Skeleton className="h-48 w-full rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton className="h-5 w-20" />

        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Meta */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Post List Skeleton
export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Post Detail Skeleton
export function PostDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      {/* Back Button */}
      <Skeleton className="h-6 w-24 mb-8" />

      {/* Cover Image */}
      <Skeleton className="h-64 md:h-96 w-full mb-8" />

      {/* Category */}
      <Skeleton className="h-6 w-24 mb-4" />

      {/* Title */}
      <Skeleton className="h-10 w-full mb-2" />
      <Skeleton className="h-10 w-3/4 mb-6" />

      {/* Meta */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-32 w-full my-6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Comment Skeleton
export function CommentSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-cyber-cyan/20 rounded-lg bg-cyber-dark/30">
      {/* Avatar */}
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

// Comment List Skeleton
export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  )
}

// Sidebar Skeleton
export function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <Skeleton className="h-6 w-32" />

      {/* Items */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 border border-cyber-cyan/20 rounded-lg">
            <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Table of Contents Skeleton
export function TOCSkeleton() {
  return (
    <div className="sticky top-24 space-y-4">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 ml-4" />
        <Skeleton className="h-4 w-4/5 ml-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 ml-4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="p-6 border border-cyber-cyan/20 rounded-lg bg-cyber-dark/30 space-y-4">
      {/* Avatar */}
      <div className="flex justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>

      {/* Name */}
      <Skeleton className="h-6 w-32 mx-auto" />

      {/* Bio */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5 mx-auto" />

      {/* Stats */}
      <div className="flex justify-center gap-6 pt-4">
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Gallery Skeleton
export function GallerySkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
  return (
    <div className="rounded-lg border border-cyber-cyan/20 bg-cyber-dark/30 overflow-hidden">
      {/* Thumbnail */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// Video List Skeleton
export function VideoListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}
