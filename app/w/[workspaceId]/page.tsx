import { redirect } from "next/navigation";

interface WorkspaceHomePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceHomePage({ params }: WorkspaceHomePageProps) {
  const { workspaceId } = await params;

  redirect(`/w/${workspaceId}/ideas`);
}
