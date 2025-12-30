"use client";

import { TweetFeed } from "@/components/TweetFeed";
import { useView } from "@/context/ViewContext";
import { TimeMachine } from "@/components/views/TimeMachine";
import { NeuralClusters } from "@/components/views/NeuralClusters";
import { QuantifiedSelf } from "@/components/views/QuantifiedSelf";
import { SystemCore } from "@/components/views/SystemCore";

export default function Home() {
  const { activeApp } = useView();

  return (
    <div className="min-h-screen">
      {activeApp === 'dashboard' && <TweetFeed />}
      {activeApp === 'timeline' && <TimeMachine />}
      {activeApp === 'tags' && <NeuralClusters />}
      {activeApp === 'analytics' && <QuantifiedSelf />}
      {activeApp === 'settings' && <SystemCore />}
      {activeApp === 'profile' && (
        <div className="flex items-center justify-center h-screen text-zinc-500">
          Profile View (Pending)
        </div>
      )}
    </div>
  );
}
