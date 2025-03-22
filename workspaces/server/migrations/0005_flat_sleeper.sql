CREATE INDEX `episode_series_id_idx` ON `episode` (`seriesId`);--> statement-breakpoint
CREATE INDEX `episode_stream_id_idx` ON `episode` (`streamId`);--> statement-breakpoint
CREATE INDEX `program_channel_id_idx` ON `program` (`channelId`);--> statement-breakpoint
CREATE INDEX `program_episode_id_idx` ON `program` (`episodeId`);--> statement-breakpoint
CREATE INDEX `program_start_at_idx` ON `program` (`startAt`);--> statement-breakpoint
CREATE INDEX `recommended_item_module_id_idx` ON `recommendedItem` (`moduleId`);--> statement-breakpoint
CREATE INDEX `recommended_item_series_id_idx` ON `recommendedItem` (`seriesId`);--> statement-breakpoint
CREATE INDEX `recommended_item_episode_id_idx` ON `recommendedItem` (`episodeId`);--> statement-breakpoint
CREATE INDEX `recommended_module_ref_idx` ON `recommendedModule` (`referenceId`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);