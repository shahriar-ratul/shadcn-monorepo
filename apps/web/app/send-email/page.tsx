"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { X, Paperclip, Send } from "lucide-react"
import { useState } from "react"

const MAX_TOTAL_SIZE = 15 * 1024 * 1024 // 15MB total for all files
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]

const formSchema = z.object({
  from: z.string().email({
    message: "Please enter a valid email address.",
  }),
  to: z.string().min(1, {
    message: "At least one recipient is required.",
  }),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, {
    message: "Subject is required.",
  }),
  body: z.string().min(1, {
    message: "Email body is required.",
  }),
})

interface FileWithBase64 {
  name: string
  size: number
  type: string
  base64: string
}

export default function SendEmailPage() {
  const [files, setFiles] = useState<FileWithBase64[]>([])
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  })
  const [successDialog, setSuccessDialog] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "",
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
    },
  })

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const getTotalFileSize = () => {
    return files.reduce((total, file) => total + file.size, 0)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      let currentTotalSize = getTotalFileSize()

      for (const file of newFiles) {
        // Check if adding this file would exceed the total limit
        if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
          const remainingSpace = MAX_TOTAL_SIZE - currentTotalSize
          setAlertDialog({
            open: true,
            title: "Total Size Limit Exceeded",
            description: `Cannot add ${file.name}. Total attachment size limit is 15MB. You have ${formatFileSize(remainingSpace)} remaining.`,
          })
          continue
        }

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          setAlertDialog({
            open: true,
            title: "Unsupported File Type",
            description: `${file.name} has an unsupported file type.`,
          })
          continue
        }

        try {
          const base64 = await convertToBase64(file)
          const fileWithBase64: FileWithBase64 = {
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64,
          }
          setFiles((prev) => [...prev, fileWithBase64])
          currentTotalSize += file.size
        } catch (error) {
          setAlertDialog({
            open: true,
            title: "File Upload Error",
            description: `Failed to process ${file.name}. Please try again.`,
          })
        }
      }
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Parse email fields (comma or semicolon separated)
    const parseEmails = (emailString: string) => {
      return emailString
        .split(/[,;]/)
        .map(email => email.trim())
        .filter(email => email.length > 0)
    }

    const emailData = {
      from: values.from,
      to: parseEmails(values.to),
      cc: values.cc ? parseEmails(values.cc) : [],
      bcc: values.bcc ? parseEmails(values.bcc) : [],
      subject: values.subject,
      body: values.body,
      attachments: files,
    }

    console.log("Email data:", emailData)
    console.log("Total attachments:", files.length)
    files.forEach((file, index) => {
      console.log(`Attachment ${index + 1}:`, {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        base64Preview: file.base64.substring(0, 50) + "...",
      })
    })

    setSuccessDialog(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
        <p className="text-muted-foreground">Compose and send a new email message</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>Fill in the details below to send your email</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="recipient@example.com, another@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Separate multiple emails with commas or semicolons</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CC (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="cc@example.com, another@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Separate multiple emails with commas or semicolons</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bcc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BCC (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="bcc@example.com, another@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Separate multiple emails with commas or semicolons</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Email subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        className="resize-none min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <FormLabel>Attachments</FormLabel>
                  <FormDescription className="mb-2">
                    Upload files (max 15MB total for all files). Supported: Images, PDF, Word, Excel, Text
                  </FormDescription>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                    />
                  </div>
                  {files.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Total size: {formatFileSize(getTotalFileSize())} / {formatFileSize(MAX_TOTAL_SIZE)}
                    </p>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Attached Files ({files.length})</p>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    setFiles([])
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Alert Dialog for Errors */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog({ ...alertDialog, open: false })}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Ready to Send!</DialogTitle>
            <DialogDescription>
              Your email has been prepared successfully. Check the console for the email data including all attachments in base64 format.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
