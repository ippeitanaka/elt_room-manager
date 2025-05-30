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
          <DialogTitle className="text-center text-xl font-bold text-pink-700">
            {timeSlot} {classGroup} {classroom}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-lg py-4">{comment}</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
