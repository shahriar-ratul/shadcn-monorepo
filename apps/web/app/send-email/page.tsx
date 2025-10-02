import { SendEmailForm } from "@/components/forms/send-email-form"

export default function SendEmailPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
        <p className="text-muted-foreground">Compose and send a new email message</p>
      </div>

      <SendEmailForm />
    </div>
  )
}
