"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  classroom: string
  comment: string
  timeSlot: string
  classGroup: string
}

export function CommentModal({ isOpen, onClose, classroom, comment, timeSlot, classGroup }: CommentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-slate-800 sm:text-xl">
            {timeSlot} {classGroup} {classroom}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="surface-subtle px-4 py-5 text-center text-sm leading-7 text-slate-700 sm:text-base">
          {comment}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
