"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect, ChangeEvent } from "react";

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
import { Textarea } from "@/components/ui/textarea";

// フォームスキーマの定義
const formSchema = z.object({
  name: z.string().min(2, {
    message: "名前は2文字以上入力してください",
  }),
  email: z.string().email({
    message: "有効なメールアドレスを入力してください",
  }),
  message: z.string().min(10, {
    message: "メッセージは10文字以上入力してください",
  }),
});

// 最適化されたInputコンポーネント
const OptimizedInput = ({ value, onChange, onBlur, ...props }: any) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);
    if (onChange && localValue !== value) onChange(localValue);
  };

  return (
    <Input
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

// 最適化されたTextareaコンポーネント
const OptimizedTextarea = ({ value, onChange, onBlur, ...props }: any) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBlur) onBlur(e);
    if (onChange && localValue !== value) onChange(localValue);
  };

  return (
    <Textarea
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default function ContactPage() {
  // フォームの初期化
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onBlur", // フォーカスアウト時にのみバリデーションを実行
  });

  // フォーム送信時の処理
  function onSubmit(values: z.infer<typeof formSchema>) {
    // フォームデータの処理（ここではコンソールに出力）
    console.log(values);
    alert("お問い合わせありがとうございます！");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">お問い合わせ</h1>
      <p className="mb-8">下記フォームよりお気軽にお問い合わせください。</p>

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>お名前</FormLabel>
                  <FormControl>
                    <OptimizedInput {...field} placeholder="山田太郎" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <OptimizedInput {...field} placeholder="taro@example.com" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メッセージ</FormLabel>
                  <FormControl>
                    <OptimizedTextarea
                      {...field}
                      placeholder="ご質問やご相談を入力してください"
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.message?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              送信する
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
