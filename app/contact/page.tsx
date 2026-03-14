"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Mail, Clock, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  topic: z.enum(["general", "support", "bug", "feature", "billing", "data"]),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(20, "Please provide more detail — at least 20 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "general", name: "", email: "", subject: "", message: "" },
  });
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(_values: ContactValues) {
    // In production, POST to your backend here
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="container max-w-2xl mx-auto px-4 py-12">
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            Message sent — we&apos;ll get back to you within 24–48 hours.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">
        We&apos;re here to help. Reach out with any questions or feedback.
      </p>

      {/* Contact info cards */}
      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        {[
          { icon: Mail, label: "Email", value: "support@marketview360.io" },
          { icon: Clock, label: "Response Time", value: "Within 24–48 hours" },
          { icon: MessageSquare, label: "Live Chat", value: "Use Jovan AI for instant help" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="shadow-none">
            <CardContent className="flex items-start gap-3 p-4">
              <Icon size={18} strokeWidth={1.5} className="text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          <FormField control={form.control} name="topic" render={({ field }) => (
            <FormItem>
              <FormLabel>What can we help you with?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="bug">Report a Bug</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="data">Data Request</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Brief description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="message" render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your question or issue in detail..."
                  className="min-h-[140px] resize-y"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="text-xs text-muted-foreground ml-auto">
                  {field.value?.length ?? 0} / 2000
                </span>
              </div>
            </FormItem>
          )} />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full sm:w-auto"
          >
            {form.formState.isSubmitting ? "Sending\u2026" : "Send Message"}
          </Button>
        </form>
      </Form>
    </main>
  );
}
