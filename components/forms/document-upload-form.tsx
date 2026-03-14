"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { UiSelect } from "@/components/forms/ui-select";
import { documentTypeOptions } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ProductSummary } from "@/lib/types/plm";

type DocumentUploadFormProps = {
  ownerId: string;
  products: ProductSummary[];
};

export function DocumentUploadForm({ ownerId, products }: DocumentUploadFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    const productId = String(formData.get("productId"));
    const documentName = String(formData.get("documentName"));
    const documentType = String(formData.get("documentType"));

    if (!(file instanceof File) || file.size === 0) {
      setErrorMessage("Choose a file to upload.");
      setIsPending(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const fileExtension = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";
      const sanitizedName = documentName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      const storagePath = `${ownerId}/${productId}/${Date.now()}_${sanitizedName}${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-documents")
        .upload(storagePath, file, {
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          documentName,
          documentType,
          storagePath,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to save document record.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to upload document.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Product</span>
        <UiSelect
          required
          name="productId"
          defaultValue=""
          placeholder="Select a product"
          options={products.map((product) => ({
            value: product.id,
            label: product.product_name,
          }))}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Document type</span>
        <UiSelect
          name="documentType"
          defaultValue="specification"
          options={documentTypeOptions}
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Document name</span>
        <input
          required
          name="documentName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="product_validation_report_v1"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">File</span>
        <input
          required
          type="file"
          name="file"
          className="w-full rounded-2xl border border-dashed border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-teal"
        />
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Uploading..." : "Upload document"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
