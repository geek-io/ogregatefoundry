# The Wandering Heroes of Ogre Gate for Foundry VTT

A Foundry VTT v13 game system for *The Wandering Heroes of Ogre Gate* by Bedrock Games.
- System by: Geek IO Dev Team

***This projrect uses copyright material owned by Bedrock Games, under their Bedrock Games Community Use Policy. This is not an official product of Bedrock Games.***


# v 0.1.5
## Chapter 2 itemization
- Bug fixes
- Added structured Poison/Disease and Herbal/Transformative Substance item types.
- Added packaged Chapter 2 compendiums for poisons, diseases, herbal cures, and longevity or transformative substances.
- Poison and disease cards now contain only their specific printed entry; shared procedure text is available once in the Chapter 2 Rules Reference journal compendium.
- The corrected Poison and Disease compendium uses a refreshed internal pack identifier so installations do not retain pre-fix card text.
- Poison and disease items can populate the actor treatment tracker by drag and drop.
- Applicable antidotes and herbal cures can be dropped onto an active affliction to apply their treatment effect.
- Actor-owned Substance items track and spend doses when used, with manual expiration controls for timed treatment effects.
- Direct-use substances can now alter Health, Imbalance, and temporary skill modifiers, with visible active-effect tracking.
- Poison and disease trackers now roll Potency exposure against Hardiness, establish lethal deadlines, and apply manually advanced Speed penalties.
- Characters can track multiple simultaneous poisons and diseases, switch the selected treatment target, and apply their accumulated listed penalties together.
- Purple Spirit Venom, thorn venoms, Xi Kang's Wine, and Malignant Wind now apply their specific Qi, timed, or failed-treatment consequences.
- Life Prolonging Pill tracks its ten-consecutive-day course, rolled lifespan gain, and later lifespan reductions.
- Kung Fu Technique items can be used normally or Cathartically from the Martial tab using their Activation Skill.
- Cathartic use now awards printed Imbalance amounts, rolls Qi Spirit Possession at `12 + Qi`, tracks daily Meditation control, and supports printed no-roll meditation recovery.
- Removed the misleading Qi Cost field: techniques require the listed Qi Rank but do not spend Qi when used.
- Fixed Kung Fu Technique items failing to appear on the Martial tab after creation or drag and drop.
- Added Qi Duel round resolution against a targeted actor, including Qi/Neigong penalties, tied-round energy buildup, and Extra Wound application.
- Prevented duplicate Kung Fu Technique imports on a single drop and added first-use Activation Skill selection for unconfigured techniques.
- Prepared Strike weapon attacks now show the declared trigger/zone in chat and automatically clear the armed strike after the interrupt attack is rolled.
- Maiming and Disarm damage cards now show rule checklists for the GM instead of a single compressed reminder line.
- Charge and mounted helpers now validate straight-line movement, mounted charge follow-through, mounted bow penalties, mounted advantage reminders, and moving-mount Cathartic Imbalance.
- Kung Fu Technique rolls now resolve book-style activation strings like `Light Melee against Parry`, and blocked technique clicks now show visible errors instead of failing silently.
- Kung Fu Technique rolls now flush visible Skill item ranks before rolling, and successful techniques with parseable Damage dice roll a damage card with Apply Wounds.
- Technique activation rolls no longer inherit the Combat Round action bonus, so a 3-rank activation skill rolls 3d10 unless the technique or a future explicit modifier says otherwise.
- Technique Activation Skills are now stored and resolved with their skill group, so `Physical: Athletics`, `physical.athletics`, and older bare `athletics` values all resolve to the actor's owned Athletics Skill item.
- Dropped Skill items now keep their own primary skill group instead of being rewritten to whichever group panel they were dropped over.
- Kung Fu Technique rows now show their current damage dice on the Martial tab when the Damage field can be calculated from fixed dice, skill ranks, discipline ranks, or Qi rank.

# v 0.1.4
## Skills compendium and sheet display
- Bug fixes
- Replaced condensed Skill compendium descriptions with full rules text from the source book.
- Ritual skill entries now include their individual Chapter 4 procedure text and shared Ritual rules.
- Added the missing Zun Forest Shaping Ritual skill entry.
- Improved actor and item sheet resizing behavior and tab readability.
- Moved Health, Qi, and Imbalance into the persistent character header.

# v 0.1.3
## Rules pass 2
- Bug fixes
- Deep Penalties and Deadly 10s are now GM world settings instead of character-sheet toggles.
- Skill Expertise now supports multiple entries per skill.
- Defenses now show their creation budget summary on the Main tab.
- Weapon sheets now use dropdowns for category, attack skill, target defense, damage skill, reach, and damage type.
- Armor sheets now include book armor/shield presets, equipped state, damage-type reductions, Speed penalties, and shield defense bonuses.
- Added customizable Skills items that can be dragged onto actor sheets and grouped by primary skill type.
- Added an Ogre Gate Skills compendium of book-listed skill choices, organized into draggable skill-group folders.
- Actor sheets accept folders of Skill items and import their non-duplicate entries.
- Weapon Reach and Damage Type are weapon item fields; weapon Damage Bonus Dice supports the book's `-1d10` entries.
- Gear section now has a New Gear button for local embedded equipment.

# v 0.1.2
## Rules pass 1
- Bug fixes
- Attack roll chat cards now offer a button to carry natural-10 damage bonus dice into the actor's next weapon damage roll.
- The Rules tab now shows the pending Damage Bonus, which can also be edited manually.
- Weapon damage rolls consume pending Damage Bonus dice after rolling and show the bonus in the chat note.
- Rules tab now includes: reach/closing, drain, healing, natural healing, and dying stabilization controls.
- Effective Qi display.
- Attack-mode reminder text for Prepared Strike, Aimed Strike, Maiming, Disarm, Mounted, Mounted Charge, and Charge.
- Prepared Strike arming/clearing helper.
- Charge and mounted attack validation reminders.
- Poison and disease Medicine treatment helper with cadence, remedy, and status tracking.
- Weapon reach is now a dropdown item field instead of free text.
- Prepared Strike tracker with Zone, Trigger, Arm, and Clear.
- Charge and Mounted validation reminders, including straight-line distance thresholds and mounted bow penalty reminder.
- Poison/Disease Medicine helper with TN, cadence, remedy required/applied, and treatment status.
- Maiming and Disarm outcome reminders on damage chat cards.

# v 0.1.1
## Character sheet pass 1
- Bug fixes
- Working character creation tab
	- Optional Races actually work
- Speed works
- Changed "Combat technique" to "Combat Perk" to avoid confusion
	- Also moved to Martial tab instead of Main.
- Cleaned up the header
- Functional flaws
	- Including dragging/dropping flaw items onto the sheet
	- Can edit / delete flaws
- Can edit/delete combat perks
- Health displays correctly
	- Get the "dying" condition when your current health is 0
	- Applying wounds will decrease your health
	- "Healthy", "Wounded", "Bloodied", "Dying" statuses
		- "Bloodied" now only appears when current Health is below 50%.
- Functional equipment
	- Can drag/drop equipment onto the character sheet to put it on your user.
- Cleared up text fields
- Karma is now GM-visible only
- Rolls for skills, defenses, and weapon attacks now prompt for TN instead of using the old top-sheet TN box.
- Changed "Martial Hero, Profound Hero, and Immortal" dropdown to "Martial Hero, Sertorius, or Mixed"
- Added Imbalance Rating, calculated from the highest Martial Discipline rank.
- Skill tooltips now describe what each skill is actually for
- Fixed skill name columns were removed, so the row now uses the abbreviation button plus Rank/Mod/Expertise.
- Skill Expertise can now be added/edited inline with a + Expertise / Edit button, and selected per skill with a checkbox.
- Creation budget summaries now appear at the bottom of each skill group.
- Flaws, Kung Fu Techniques, and Combat Perks now show creation-count summaries in their sections.
- Currency labels are now Title Case, including Paper Currency.



# v 0.1.0
- Initial Release
	- Core system
	- UI Features
	- Character creation factored in
	- Easy to read and understand "Dark mode" UI
	- Optional Races
	
