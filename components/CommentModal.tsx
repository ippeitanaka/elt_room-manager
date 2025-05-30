"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

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
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </Button>
        </DialogHeader>
        <DialogDescription className="text-center text-lg py-4">{comment}</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
