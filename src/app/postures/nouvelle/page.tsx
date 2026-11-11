"use client";

import { useRouter } from "next/navigation";
import { PoseForm } from "@/components/PoseForm";
import { useStore } from "@/lib/store";

export default function NewPosePage() {
  const router = useRouter();
  const addCustomPose = useStore((s) => s.addCustomPose);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nouvelle posture</h1>
      <PoseForm submitLabel="Créer la posture" onSubmit={(d) => router.push(`/postures/${addCustomPose(d)}`)} />
    </div>
  );
}
