import { Game, TransformedGame } from "../types";
import { Adapter } from "./adapter";

class GameAdapter extends Adapter<Game, TransformedGame> {
  private getChatDisabled() {
    return (
      this.adaptee.DisableConferenceChat &&
      this.adaptee.DisableGroupChat &&
      this.adaptee.DisablePrivateChat
    );
  }

  adapt(): TransformedGame {
    return {
      anonymous: this.adaptee.Anonymous,
      chatDisabled: this.getChatDisabled(),
      chatLanguage: this.adaptee.ChatLanguageISO639_1,
      closed: this.adaptee.Closed,
      conferenceChatEnabled: !this.adaptee.DisableConferenceChat,
      createdAt: this.asDate(this.adaptee.CreatedAt),
      endYear: this.adaptee.LastYear,
      finished: this.adaptee.Finished,
      finishedAt: this.asDate(this.adaptee.FinishedAt),
      groupChatEnabled: !this.adaptee.DisableGroupChat,
      id: this.adaptee.ID,
      name: this.adaptee.Desc,
      newestPhaseMeta: this.adaptee.NewestPhaseMeta,
      numPlayers: this.adaptee.NMembers,
      playerIdentity: this.adaptee.Anonymous ? "anonymous" : "public",
      privateChatEnabled: !this.adaptee.DisablePrivateChat,
      privateGame: this.adaptee.Private,
      started: this.adaptee.Started,
      startedAt: this.asDate(this.adaptee.StartedAt),
      status: this.adaptee.Finished
        ? "finished"
        : this.adaptee.Started
        ? "started"
        : "staging",
      variant: this.adaptee.Variant,
      visibility: this.adaptee.Private ? "private" : "public",
    };
  }
}

export const gameAdapter = (game: Game) => new GameAdapter(game).adapt();
