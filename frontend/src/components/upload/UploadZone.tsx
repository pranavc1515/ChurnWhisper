import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  disabled?: boolean
}

export function UploadZone({
  onFileSelect,
  accept = { "text/csv": [".csv"] },
  disabled,
}: UploadZoneProps) {
  const [error, setError] = useState("")
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError("")
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.size > 25 * 1024 * 1024) {
          setError("File too large (max 25MB)")
          return
        }
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled,
  })
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <p className="text-muted-foreground">
        {isDragActive ? "Drop the CSV here" : "Drag & drop a CSV file, or click to select"}
      </p>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
