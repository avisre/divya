import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function ContactPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      category: "other",
      subject: "",
      message: "",
      bookingReference: ""
    }
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => userApi.contact(payload),
    onSuccess: () => {
      setMessage("Support request submitted. We'll follow up by email.");
      form.reset({
        name: user?.name || "",
        email: user?.email || "",
        category: "other",
        subject: "",
        message: "",
        bookingReference: ""
      });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Unable to send your request.");
    }
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate({
      ...values,
      context: {
        platform: "web",
        screen: "contact",
        bookingReference: values.bookingReference
      }
    })
  );

  return (
    <div className="page-stack narrow-stack">
      <HeroSection
        eyebrow="Support"
        title="Tell us what you need help with"
        subtitle="Contact requests are stored in MongoDB and sent to the admin inbox for follow-up."
      />
      <SectionCard title="Contact form">
        <form className="stack-form" onSubmit={onSubmit}>
          <label>
            Name
            <input {...form.register("name")} />
          </label>
          <label>
            Email
            <input type="email" {...form.register("email")} />
          </label>
          <label>
            Category
            <select {...form.register("category")}>
              <option value="booking_help">Booking help</option>
              <option value="gothram_help">Gothram help</option>
              <option value="technical_issue">Technical issue</option>
              <option value="feature_request">Feature request</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Subject
            <input {...form.register("subject")} />
          </label>
          <label>
            Message
            <textarea rows={6} {...form.register("message")} />
          </label>
          <label>
            Booking reference
            <input {...form.register("bookingReference")} />
          </label>
          {message ? <StatusStrip tone="success">{message}</StatusStrip> : null}
          <Button type="submit" block disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}
