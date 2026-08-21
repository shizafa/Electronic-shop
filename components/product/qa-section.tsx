"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";

// A real Q&A entry, once a questions table exists. Empty array today — the empty state below
// is accurate, not a placeholder.
export interface ProductQuestion {
  id: string;
  authorName: string;
  question: string;
  answer?: string;
  createdAt: string;
}

interface QASectionProps {
  questions: ProductQuestion[];
}

export function QASection({ questions }: QASectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState("");

  // TODO: no questions table exists yet — this just resets the form. Wire up to a real
  // submission once the backend for Q&A is built.
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setDraftQuestion("");
    setIsFormOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("product.qandaEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {questions.map((item) => (
            <li key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.authorName} · {item.createdAt}
                  </p>
                </div>
              </div>
              {item.answer && <p className="mt-2 pl-6 text-sm text-muted-foreground">{item.answer}</p>}
            </li>
          ))}
        </ul>
      )}

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{t("product.qandaComingSoon")}</p>
          <Textarea
            value={draftQuestion}
            onChange={(event) => setDraftQuestion(event.target.value)}
            placeholder={t("product.questionPlaceholder")}
            rows={3}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={draftQuestion.trim().length === 0}>
              {t("product.submitQuestion")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsFormOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setIsFormOpen(true)}>
          {t("product.askQuestion")}
        </Button>
      )}
    </div>
  );
}
