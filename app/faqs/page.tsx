import type { Metadata } from "next";
import { AccordionSection } from "@/components/product/accordion-section";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("footer.faqs"),
};

const faqs = [
  {
    question: "Is Cash on Delivery available on all orders?",
    answer:
      "Cash on Delivery is available for orders up to Rs. 300,000. For orders above that, please choose JazzCash, Easypaisa, a card, or a Raast bank transfer at checkout. COD orders are verified with an SMS/OTP code before dispatch.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most orders are delivered within 3-7 business days, depending on your city. You'll receive SMS updates as your order moves through processing, dispatch, and delivery.",
  },
  {
    question: "Which cities support installation?",
    answer:
      "Air conditioners currently include installation scheduling in Karachi, Lahore, Islamabad, Rawalpindi, and Faisalabad. If your city isn't listed at checkout, your order will still be delivered, but you'll need to arrange installation independently.",
  },
  {
    question: "How do I schedule my AC installation?",
    answer:
      "If your order includes an air conditioner and your city supports installation, you'll be able to pick a date and time slot directly during checkout.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery, JazzCash, Easypaisa, credit/debit cards, and Raast bank transfers.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes. Once your order is marked Delivered, you can request a return from your account's order history. Our team will review the request and process a refund once the return is confirmed.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Log in and go to My Orders to see the current status of every order, including a step-by-step progress timeline.",
  },
];

export default function FaqsPage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("footer.faqs")}</h1>
      <div className="mt-6">
        {faqs.map((faq) => (
          <AccordionSection key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </AccordionSection>
        ))}
      </div>
    </div>
  );
}