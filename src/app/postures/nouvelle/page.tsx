"use client";

import { useRouter } from "next/navigation";
import { PoseForm } from "@/components/PoseForm";
import { useMessages } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const M = {
  fr: { title: "Nouvelle posture", create: "Créer la posture" },
  en: { title: "New pose", create: "Create pose" },
  es: { title: "Nueva postura", create: "Crear postura" },
};

export default function NewPosePage() {
  const t = useMessages(M);
  const router = useRouter();
  const addCustomPose = useStore((s) => s.addCustomPose);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <PoseForm submitLabel={t.create} onSubmit={(d) => router.push(`/postures/${addCustomPose(d)}`)} />
    </div>
  );
}
