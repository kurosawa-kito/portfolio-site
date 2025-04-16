"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import React from "react";

const signupSchema = z.object({
  loginid: z.string().min(1, "loginIdRequired"),
  password: z.string().min(1, "passwordRequired"),
  display_name: z.string().min(1, "displayNameRequired"),
  email: z.string().email("emailInvalid"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

/** フォーカス時のボーダーを青色,エラー時赤色にする */
const getInputClassNames = <T extends Record<string, string>>(
  errors: FieldErrors<T>,
  fieldName: string & keyof T
): string => {
  return `border border-[#757575] rounded-md focus:outline-none focus:ring-0 focus-visible:ring-transparent ${
    errors[fieldName]
      ? "border-2 custom-border-red"
      : "focus:border-2 custom-focus-border-blue"
  }`;
};

// Memoized FormLabel to prevent unnecessary re-renders
const MemoizedFormLabel = React.memo(({ children }) => (
  <FormLabel>{children}</FormLabel>
));

const ContactPage = () => {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {},
  });

  const onSubmit = async (values: SignupFormValues) => {
    console.log("Submitted:", values);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">サインアップ</h1>
      <p className="mb-8">下記フォームでサインアップしてください。</p>

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="signup-form">
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem className="item">
                  <MemoizedFormLabel>Display Name</MemoizedFormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className={cn(
                        getInputClassNames(
                          form.formState.errors,
                          "display_name"
                        ),
                        "display-name-input"
                      )}
                      placeholder="Enter display name"
                      aria-label="表示名を入力してください"
                    />
                  </FormControl>
                  {form.formState.errors.display_name &&
                    form.formState.touchedFields.display_name && (
                      <strong className="error-message">
                        {form.formState.errors.display_name.message}
                      </strong>
                    )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="item">
                  <MemoizedFormLabel>Email</MemoizedFormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className={cn(
                        getInputClassNames(form.formState.errors, "email"),
                        "email-input"
                      )}
                      placeholder="Enter email"
                      aria-label="メールアドレスを入力してください"
                    />
                  </FormControl>
                  {form.formState.errors.email &&
                    form.formState.touchedFields.email && (
                      <strong className="error-message">
                        {form.formState.errors.email.message}
                      </strong>
                    )}
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded mt-4"
            >
              Submit
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ContactPage;
