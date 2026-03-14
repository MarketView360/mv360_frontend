"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lightbulb, Gift, Star } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const feedbackSchema = z.object({
  type: z.enum(["general", "feature", "bug", "improvement"]),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Please provide a bit more detail"),
  rating: z.string().optional(),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const { user, session } = useAuth();
  const token = session?.access_token || null;

  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { type: "general", subject: "", message: "" },
  });

  async function onSubmit(values: FeedbackValues) {
    if (!token) {
      toast.error("Please log in to submit feedback.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: values.type,
          subject: values.subject.trim(),
          message: values.message.trim(),
          ...(values.rating && { rating: Number(values.rating) }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit feedback");
      }

      toast.success("Feedback sent — thank you!");
      form.reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send feedback."
      );
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          We Value Your Feedback
        </h1>
        <p className="text-muted-foreground">
          Your insights help us build a better experience for everyone.
        </p>
      </div>

      {/* Callout cards */}
      <div className="grid gap-3 mb-8 sm:grid-cols-2">
        <Alert>
          <Lightbulb
            size={16}
            strokeWidth={1.75}
            className="text-amber-500"
            aria-hidden="true"
          />
          <AlertDescription>
            <strong>Quick tip:</strong> Quality feedback helps us improve faster.
          </AlertDescription>
        </Alert>
        <Alert>
          <Gift
            size={16}
            strokeWidth={1.75}
            className="text-primary"
            aria-hidden="true"
          />
          <AlertDescription>
            <strong>Bonus:</strong> Exceptional feedback may earn early access to new features.
          </AlertDescription>
        </Alert>
      </div>

      {/* Auth-aware "submitting as" */}
      {user ? (
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <span>Submitting as</span>
          <span className="font-medium text-foreground">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
      ) : (
        <Alert className="mb-6">
          <AlertDescription>
            Submitting anonymously.{" "}
            <a href="/auth/login" className="text-primary underline underline-offset-4">
              Sign in
            </a>{" "}
            to track your feedback and get updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Form — shadcn Form + react-hook-form + Zod */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Star rating */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate your experience</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-2"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="flex items-center">
                        <RadioGroupItem
                          value={String(n)}
                          id={`rating-${n}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`rating-${n}`}
                          className="cursor-pointer"
                        >
                          <Star
                            size={24}
                            strokeWidth={1.5}
                            aria-label={`${n} star${n > 1 ? "s" : ""}`}
                            className={cn(
                              "transition-colors",
                              Number(field.value) >= n
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            )}
                          />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Feedback type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="improvement">Improvement Idea</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Brief summary of your feedback"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what's on your mind..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground ml-auto">
                    {field.value.length} characters
                  </span>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending\u2026" : "Send Feedback"}
          </Button>
        </form>
      </Form>
    </main>
  );
}
