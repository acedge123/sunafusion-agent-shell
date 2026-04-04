import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWiki, WikiPage } from "@/hooks/useWiki";
import WikiPageList from "@/components/wiki/WikiPageList";
import WikiPageDetail from "@/components/wiki/WikiPageDetail";
import WikiSourceList from "@/components/wiki/WikiSourceList";
import WikiArtifactList from "@/components/wiki/WikiArtifactList";
import WikiActions from "@/components/wiki/WikiActions";
import { BookOpen } from "lucide-react";

const Wiki = () => {
  const { user } = useAuth();
  const wiki = useWiki(user?.id);
  const [detailPage, setDetailPage] = useState<WikiPage | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Wiki</h1>
        </div>

        <Tabs defaultValue="pages">
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            {detailPage ? (
              <WikiPageDetail
                page={detailPage as WikiPage & { linked_sources?: any[] }}
                onBack={() => setDetailPage(null)}
                onFetchFull={(id) => wiki.fetchPage(id).then(() => {
                  if (wiki.selectedPage) setDetailPage(wiki.selectedPage as WikiPage);
                })}
              />
            ) : (
              <WikiPageList
                pages={wiki.pages}
                loading={wiki.loading}
                onFetch={wiki.fetchPages}
                onSelect={setDetailPage}
              />
            )}
          </TabsContent>

          <TabsContent value="sources">
            <WikiSourceList
              sources={wiki.sources}
              loading={wiki.loading}
              onFetch={wiki.fetchSources}
              onCompile={async (id) => { await wiki.compileSource(id); wiki.fetchSources(); }}
            />
          </TabsContent>

          <TabsContent value="artifacts">
            <WikiArtifactList
              artifacts={wiki.artifacts}
              loading={wiki.loading}
              onFetch={wiki.fetchArtifacts}
            />
          </TabsContent>

          <TabsContent value="actions">
            <WikiActions
              loading={wiki.loading}
              onReindex={wiki.reindex}
              onLint={wiki.lint}
              onCompileTopic={wiki.compileTopic}
              onAnswer={wiki.answer}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wiki;
