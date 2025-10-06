"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
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
import { X, Paperclip, Send, Copy, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { sendEmail, type EmailPayload } from "@/services/email"
import { de } from "zod/locales"

const MAX_TOTAL_SIZE = 150 * 1024 * 1024 // 15MB total for all files
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
  source: z.string().min(1, { message: "Source is required" }),
  from: z.email({ message: "Please enter a valid email address" }),
  to: z.string().min(1, { message: "At least one recipient is required" }),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required" }),
  emailType: z.enum(["text", "html", "auto-generate"]),
  textBody: z.string().optional(),
  htmlBody: z.string().optional(),
  autoPrompt: z.string().optional(),
  templateId: z.string().optional(),
})

interface FileWithBase64 {
  name: string
  size: number
  type: string
  base64: string
  originalName?: string
}

interface HtmlImage {
  filename: string
  base64: string
  originalName?: string
}

export function SendEmailForm() {
  const [files, setFiles] = useState<FileWithBase64[]>([])
  const [htmlImages, setHtmlImages] = useState<HtmlImage[]>([])
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  })
  const [jsonPayload, setJsonPayload] = useState<string>("")
  const [payloadObject, setPayloadObject] = useState<EmailPayload | null>(null)
  const [showPayloadDialog, setShowPayloadDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: "QR-something",
      from: "sama2lokal@maybank.com",
      to: "atik.shahriarratul@maybank.com",
      cc: "",
      bcc: "",
      subject: "Test",
      emailType: "html",
      textBody: "",
      htmlBody: "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta http-equiv=\"x-ua-compatible\" , content=\"IE=edge\"><meta name=\"viewport\" , content=\"width=device-width, initial-scale=1\"><style>* {box-sizing: border-box;}body {width: 100%;text-align: center;font-family: 'Helvetica', 'Arial', sans-serif;}.container {display: inline-block;width: 600px;background: #FFF;text-align: start;}.heading {width: inherit;height: 242px;background-repeat: no-repeat;background-size: auto 100%;background-position: right center;position: relative;}.heading .header-img {width: 100%;height: 100%;}.heading .logo {position: absolute;top: 11px;left: 9px;}.heading .floating-circle {position: absolute;width: 134px;height: 134px;left: 62px;top: 77px;background: #FECE00;border-radius: 50%;}.heading .text-wrap {position: absolute;width: 126px;height: 65px;top: 50%;left: 50%;transform: translate(-50%, -50%);text-align: center;padding-top: 10px;}.heading .text-wrap span {font-size: 12px;}.heading .text-wrap .label {font-size: 15px;font-weight: bold;}.content {padding: 24px 46px;}.content .message {font-size: 16px;line-height: 21px;}.content .infos {margin-top: 30px;padding: 30px 27px;width: 506px;box-shadow: 0px 4px 35px rgba(0, 0, 0, 0.2);}.content .infos table {width: 100%;}.content .infos table tr {line-height: 20px;font-size: 15px;}.content .info-row td:nth-child(1) {text-align: start;letter-spacing: 1px;}.content .info-row td:nth-child(2) {text-align: end;font-weight: bold;letter-spacing: 0.5px;}.footer {text-align: center;margin-top: 20px;}.footer > span {font-size: 13px;}</style></head><body><div class=\"container\"><div class=\"heading\"><img class=\"header-img\" src=\"cid:header.png\" /><img src=\"cid:maybank_logo.png\" class=\"logo\"/><div class=\"floating-circle\"><div class=\"text-wrap\"><span class=\"label\">Congratulations!</span><span>Your loan/financing is approved</span></div></div></div><div class=\"content\"><p class=\"message\">Dear <b>Andy Eng,</b><br/><br/>Your Personal Loan/Financing-i has been approved! <br/><br/>Congrats! Go to Maybank2u to check your account balance now.<br/>Your loan/financing details as below:</p><div class=\"infos\"><table><tr class=\"info-row\"><td>Facility</td><td>Personal Financing-i</td></tr><tr class=\"info-row\"><td>Loan/Financing Amount</td><td>RM 9,750</td></tr><tr class=\"info-row\"><td>Tenure</td><td>3 years</td></tr><tr class=\"info-row\"><td>Interest/Profit Rate</td><td>8% p.a</td></tr><tr class=\"info-row\"><td>Monthly Payments</td><td>RM 300</td></tr><tr class=\"info-row\"><td>Payout Account</td><td>Savings Account 123123133213</td></tr><tr class=\"info-row\"><td>Reference Number</td><td>M2908C1675</td></tr></table></div></div><div class=\"footer\"><span>Call <b>1300 8866 88,</b> or log on to <b>www.maybank2u.com.my</b> for more information.</span><img src=\"cid:footer.png\"/></div></div></body></html>",
      autoPrompt: "",
      templateId: "1",
    },
  })

  const emailType = form.watch("emailType")

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
            originalName: file.name,
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
    e.target.value = ""
  }

  const handleHtmlImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      for (const file of newFiles) {
        if (!file.type.startsWith("image/")) {
          setAlertDialog({
            open: true,
            title: "Invalid File Type",
            description: `${file.name} is not an image file.`,
          })
          continue
        }

        try {
          const base64 = await convertToBase64(file)
          const htmlImage: HtmlImage = {
            filename: file.name,
            base64: base64,
            originalName: file.name,
          }
          setHtmlImages((prev) => [...prev, htmlImage])
        } catch (error) {
          setAlertDialog({
            open: true,
            title: "File Upload Error",
            description: `Failed to process ${file.name}. Please try again.`,
          })
        }
      }
    }
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeHtmlImage = (index: number) => {
    setHtmlImages((prev) => prev.filter((_, i) => i !== index))
  }

  const updateImageFilename = (index: number, newFilename: string) => {
    setHtmlImages((prev) => prev.map((img, i) =>
      i === index ? { ...img, filename: newFilename } : img
    ))
  }

  const updateAttachmentFilename = (index: number, newFilename: string) => {
    setFiles((prev) => prev.map((file, i) =>
      i === index ? { ...file, name: newFilename } : file
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const parseEmails = (emailString: string) => {
    return emailString
      .split(/[,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)
      .join(",")
  }

  const generateTxnRefNo = () => {
    return `Email-${Date.now()}`
  }

  const generateHtmlFromPrompt = (prompt: string, images: HtmlImage[]) => {
    // Simple HTML generation based on prompt
    let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f4}.container{max-width:600px;margin:0 auto;background:#fff}.header{width:100%;height:auto}.content{padding:20px}.footer{width:100%;height:auto}</style></head><body><div class="container">`

    // Add header image if mentioned
    const headerImage = images.find(img => img.filename.toLowerCase().includes('header'))
    if (headerImage || prompt.toLowerCase().includes('header')) {
      const imgRef = headerImage ? `cid:img@${headerImage.filename}` : 'cid:img@header.png'
      html += `<img class="header" src="${imgRef}" alt="Header" />`
    }

    // Add content section
    html += `<div class="content"><p>${prompt}</p></div>`

    // Add footer image if mentioned
    const footerImage = images.find(img => img.filename.toLowerCase().includes('footer'))
    if (footerImage || prompt.toLowerCase().includes('footer')) {
      const imgRef = footerImage ? `cid:img@${footerImage.filename}` : 'cid:img@footer.png'
      html += `<img class="footer" src="${imgRef}" alt="Footer" />`
    }

    html += `</div></body></html>`
    return html
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isText = values.emailType === "text"
    const isAutoGenerate = values.emailType === "auto-generate"

    const payload: any = {
      txnRefNo: generateTxnRefNo(),
      source: values.source,
      payload: {
        from: values.from,
        subject: values.subject,
        to: parseEmails(values.to),
        cc: values.cc ? parseEmails(values.cc) : "",
        bcc: values.bcc ? parseEmails(values.bcc) : "",
      },
      additionalInfo: {
        template_id: parseInt(values.templateId || "1"),
        isText: isText,
      }
    }
    if(values.cc) {
      payload.payload.cc = parseEmails(values.cc)
    } else {
      delete payload.payload.cc
    }
    if(values.bcc) {
      payload.payload.bcc = parseEmails(values.bcc)
    } else {
      delete payload.payload.bcc
    }


    if (isText) {
      // Text email format
      payload.payload.html = values.htmlBody || ""
      payload.payload.text = values.textBody || ""
    } else if (isAutoGenerate) {
      // Auto-generate HTML from text and images
      const generatedHtml = generateHtmlFromPrompt(values.autoPrompt || "", htmlImages)
      payload.payload.html = generatedHtml
      payload.additionalInfo.isText = false

      if(htmlImages.length > 0) { 
        payload.additionalInfo.html_images = htmlImages.map(img => ({ filename: img.filename, base64: img.base64 }))
      }
      if(files.length > 0) {
        payload.additionalInfo.attachment_files = files.map(f => ({ filename: f.name, base64: f.base64 }))
      }
    } else {
      // HTML email with attachments (manual HTML)
      payload.payload.html = values.htmlBody || ""
      payload.additionalInfo.isText = false

      if(htmlImages.length > 0) {
        payload.additionalInfo.html_images = htmlImages.map(img => ({ filename: img.filename, base64: img.base64 }))
      }
      if(files.length > 0) {
        payload.additionalInfo.attachment_files = files.map(f => ({ filename: f.name, base64: f.base64 }))
      }
    }


    const jsonString = JSON.stringify(payload, null, 4)
    setJsonPayload(jsonString)
    setPayloadObject(payload)
    setShowPayloadDialog(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = async () => {
    if (!payloadObject) return

    setIsSending(true)
    try {
      const response = await sendEmail(payloadObject)
      console.log(response)
      setAlertDialog({
        open: true,
        title: "Email Sent Successfully",
        description: `Email has been sent successfully. ${response.message || ''}`,
      })
      setShowPayloadDialog(false)
      form.reset()
      setFiles([])
      setHtmlImages([])
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: "Failed to Send Email",
        description: error.response?.data?.message || error.message || "An error occurred while sending the email.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
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
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input
                        
                        placeholder="e.g., QR-something, Testing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Email Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="text" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Text Email
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="html" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            HTML Email with Attachments
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="auto-generate" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Auto Generate from Text to HTML
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {emailType === "text" && (
                <>
                  <FormField
                    control={form.control}
                    name="textBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Plain text message..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="htmlBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTML Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="HTML content..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {emailType === "html" && (
                <>
                  <FormField
                    control={form.control}
                    name="htmlBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTML Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="<!DOCTYPE html>..."
                            className="resize-none min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div>
                      <FormLabel>HTML Images (for inline images)</FormLabel>
                      <FormDescription className="mb-2">
                        Upload images to be embedded in HTML (use cid: references)
                      </FormDescription>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("html-image-upload")?.click()}
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Add HTML Images
                        </Button>
                        <input
                          id="html-image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleHtmlImageChange}
                        />
                      </div>
                    </div>

                    {htmlImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">HTML Images ({htmlImages.length})</p>
                        <div className="space-y-2">
                          {htmlImages.map((img, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                            >
                              <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0 space-y-1">
                                <Input
                                  type="text"
                                  value={img.filename}
                                  onChange={(e) => updateImageFilename(index, e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="image.png"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Will be referenced as: cid:img@{img.filename}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeHtmlImage(index)}
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

                  <div className="space-y-4">
                    <div>
                      <FormLabel>Attachment Files</FormLabel>
                      <FormDescription className="mb-2">
                        Upload files (max 15MB total). Supported: Images, PDF, Word, Excel, Text
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
                              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                            >
                              <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1 space-y-1">
                                <Input
                                  type="text"
                                  value={file.name}
                                  onChange={(e) => updateAttachmentFilename(index, e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="filename.pdf"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)} • {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                                </p>
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
                </>
              )}

              {emailType === "auto-generate" && (
                <>
                  <FormField
                    control={form.control}
                    name="autoPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe Your Email</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: I want a professional email with a header image showing our logo, a welcome message for new customers, and a footer with contact information..."
                            className="resize-none min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe what you want in the email. Mention if you need images (header, footer, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div>
                      <FormLabel>Upload Images (Optional)</FormLabel>
                      <FormDescription className="mb-2">
                        Upload images mentioned in your description (header, footer, logo, etc.)
                      </FormDescription>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("auto-image-upload")?.click()}
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Add Images
                        </Button>
                        <input
                          id="auto-image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleHtmlImageChange}
                        />
                      </div>
                    </div>

                    {htmlImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Uploaded Images ({htmlImages.length})</p>
                        <div className="space-y-2">
                          {htmlImages.map((img, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                            >
                              <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0 space-y-1">
                                <Input
                                  type="text"
                                  value={img.filename}
                                  onChange={(e) => updateImageFilename(index, e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="image.png"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Will be referenced as: cid:img@{img.filename}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeHtmlImage(index)}
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

                  <div className="space-y-4">
                    <div>
                      <FormLabel>Attachment Files (Optional)</FormLabel>
                      <FormDescription className="mb-2">
                        Upload files (max 15MB total). Supported: Images, PDF, Word, Excel, Text
                      </FormDescription>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("auto-file-upload")?.click()}
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Attach Files
                        </Button>
                        <input
                          id="auto-file-upload"
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
                              className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                            >
                              <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1 space-y-1">
                                <Input
                                  type="text"
                                  value={file.name}
                                  onChange={(e) => updateAttachmentFilename(index, e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="filename.pdf"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)} • {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                                </p>
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

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>How it works:</strong> When you submit, the system will convert your description into HTML email code.
                      Images you upload will be automatically referenced in the HTML using <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">cid:</code> references.
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Generate Payload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    setFiles([])
                    setHtmlImages([])
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

      {/* JSON Payload Dialog */}
      <Dialog open={showPayloadDialog} onOpenChange={setShowPayloadDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Email Payload JSON</DialogTitle>
            <DialogDescription>
              Copy this JSON payload to send the email
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[50vh] text-sm font-mono whitespace-pre-wrap break-all">
              {jsonPayload}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPayloadDialog(false)}>
              Close
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
