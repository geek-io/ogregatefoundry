# The Wandering Heroes of Ogre Gate for Foundry VTT

A Foundry VTT v13 game system for *The Wandering Heroes of Ogre Gate* by Bedrock Games.
- System by: Geek IO Dev Team

***This projrect uses copyright material owned by Bedrock Games, under their Bedrock Games Community Use Policy. This is not an official product of Bedrock Games.***

# v 0.2.2
## NPC and Monster pass 2
- Added the chapter 9 NPCs to the compendium.
- Named NPCs with a biography have it listed on the sheet under Notes -> Biography.
- NPCs with armor and weapons have them listed properly.

# v 0.2.1
## NPC and Monster pass 1
- Companion App technique imports now detect printed damage phrases such as `6d10 Open Damage` and populate the Technique item's Damage and Open Damage fields.
- Companion App technique imports now capture obvious Extra Wound text and the shared Hardiness drain reminder in techniques such as Headless Ghost's Vengeance.
- Added the first Actor compendium pack: NPCs, Threats, and Monsters.
- Seeded the NPC pack with an initial Chapter 10 Human Threats folder for live-table testing.
- Expanded the NPC pack with additional Chapter 10 human threats and sample masters, including Zun soldiers, Zun Demon Master, Zun Warrior, and the Fearsome, Deadly, and Profound Master templates.
- Added an initial Monsters folder to the NPC pack with itemized Power entries for Water Monkeys, Fei Beasts, Fire Gluttons, Golden Guardians, E Gui, Shui Gui, Jiangshi, and Jufu.
- Monster-specific attack skills such as Bite, Claws, Gore, and Fire Breath now import into the Combat skill group instead of being treated as generic Specialist skills.
- Monster statblock skill damage notes now generate natural-attack Weapon items, so attacks such as Claws, Bite, Gore, and Fire Breath appear on the Gear tab with attack and damage buttons.
- Expanded the Monsters folder with Kui Demon, Leather Shadow Puppets, Longzhi, Naga, Virtuous Naga, Nao Ren, Ogre Demon, and Painted Death.
- Monster natural-attack parsing now recognizes `9d10 Open` and `Damage 4d10 Open` wording, and power names such as `Qi Immunity` no longer get mistaken for core stat fields.
- Added a larger Chapter 10 monster/Qi spirit batch, including Qi Spirit templates, Red Ru-Fish, Raksha Demon, Roc, Skeleton variants, Xiaoyang, Yaksha Demon, Yumen, and Zhen Bird.
- Creature-only attack names such as Peck and Peck/Bite now import as Combat skills and generate natural-attack weapons when damage is printed in the statblock.
- Finished the Chapter 10 creature and named-threat compendium pass with animals, demons, ghosts, mountain gods, celestial demons, Supreme Judge Yu, and The Yao; the NPC pack now builds to 77 actors.
- Statblock field detection now handles labels like `Key Kung Fu Techniques (Waijia 2):`, preventing weapons from swallowing following technique fields during import.
- Book weapon parsing now handles `Damage 5d10` and `7d10 Open Damage` phrasing in addition to the existing `5d10 Damage` style.
- Finished the Chapter 10 human threats and sect-member pass, adding Society of Leather Shadows, Dehua, Golden Dragon, Hai'an, Heiping, Majestic Lion, Mystic Sword, Nature Loving Monk, Perfect Heaven, Purple Cavern, Red Claw, Southern River, Sun Mai, Nine Suns, Tree-Dwelling Nun, Zhaoze, and Zhe Valley templates.
- Plain `Techniques (Waijia...)` statblock fields now split correctly from Combat Technique fields, so sect NPCs such as Mount Hai'an and Majestic Lion entries keep their combat perks and Kung Fu technique lists separate.
- Added source and pack builder scripts for future NPC/monster compendium expansion.

# v 0.2.0
## Live table and NPC workflow
- Added a compact NPC/monster sheet with a main Skills panel grouped by skill category and alphabetized within each group.
- Added Item Directory technique importing; the importer can now create Technique items from pasted lists, statblock technique sections, Bedrock-style JSON technique name arrays, or technique item JSON.
- Technique importing now supports Companion App multi-line technique exports with Discipline, Skill, Type, Qi, Requirement, and Cathartic fields.
- Monster and NPC statblock imports now preserve `Powers` sections as embedded Power items visible on the compact NPC/monster sheet.
- Added a Power item type for monster/NPC abilities with trigger, optional roll/target fields, effect text, and mechanical notes.
- Power item descriptions are displayed and saved as plain text so imported monster rules do not expose raw HTML tags.
- Skill rows on the character sheet can now be moved up or down within their skill group.
- Cleaned the Martial tab technique layout so long technique names, damage/effect notes, and action buttons no longer overlap in narrower sheet windows.

# v 0.1.9
## Bug fixes and character workflow polish
- Skill Expertise checkbox selections now persist through sheet re-renders and Expertise edits instead of clearing other active Expertise selections.
- The importer now reads common book-style `Expertise:` lines such as `Detect-Sight` and attaches them to matching imported Skill items when it can.
- Imported statblocks start with Character Creation Mode disabled, and actor sheets now include a Creation Mode toggle to show or hide creation checks, budgets, and the Creation tab.

# v 0.1.8
## Statblock Importer phase 1
- Bug fixes
- Added a importer based around the formats that https://bedrockcompanion.github.io/ uses for their exported characters.
	- The importer supports JSON and Plaintext, and book fromatted characters.
	- JSON imports now support the direct Bedrock Companion save shape with `Defenses`, `Skills`, `Equipment`, `CombatTechniques`, and `TechniqueNames`.
	- Plaintext imports now tolerate book-style statblocks copied from Chapter 9 NPCs or Chapter 10 threats, including wrapped fields, `Qi Rank`, `Wounds`, `Key Kung Fu Techniques`, and book weapon notes.
	- Imports defenses, key skills, Qi, max wounds, weapons, combat techniques, discipline ranks, and Kung Fu techniques.
	- Technique names try to match the existing Kung Fu Techniques compendium; misses become placeholder technique items.
	- Weapon attack/damage totals are back-solved into item Accuracy/Damage Bonus Dice using imported skill ranks.
- Actors directory gets an `Import Character` button.

# v 0.1.7
## Equipment pass 1
- Bug fixes
- Added packaged Weapons and Armor/Shields compendiums from the Chapter 5 equipment tables.
- Weapons are organized by combat skill and include attack skill, target defense, damage skill, damage dice, accuracy, reach, damage type, Muscle requirement, lethality, and special-rule notes.
- Armor and shields are organized into Armor and Shields folders and include equipped state, damage reductions, Speed penalties, shield defense bonuses, Muscle requirement, and cost.
- Equipment items now have a category dropdown for future goods, tools, food/drink, instruments, mounts/transport, treasure, and trade goods.
- Gear tab inventory rows now show category/type, quantity or equipped state, and cost metadata.
- Weapon damage rolls now resolve grouped damage skills such as Physical: Speed and Mental: Reasoning, while preserving older bare `muscle`-style weapon data.
- Added a packaged Goods, Services, and Transport compendium covering Chapter 5 mounts, ships, vehicles, food/drink, instruments, alchemical supplies, trade goods, clothing, common goods, and services.
- Equipment items in the Mount or Transport category now show Performance Rating, Handling Speed, Miles per Day, Speed Score, Evade, Hardiness, Integrity/Health, and Damage fields.
- Character creation checks now warn for missing Chapter 5 starting equipment: one weapon, one set of clothes, and one additional item.
- Creation tab now includes an Add Starter Gear dialog for selecting and adding the Chapter 5 starting weapon, clothing, and additional item without browsing compendiums manually.
- Gear tab now shows an equipped armor/shield summary and lets armor or shield items be equipped/unequipped directly from the inventory row.
- Mount and Transport gear rows now show Evade/Hardiness, can roll Ride or Sail control checks against Performance Rating, and can post their travel/combat stats to chat.
- Weapon attacks now apply matching weapon Expertise from the attack Skill item, and attack chat cards include a Roll Damage button that carries total-success damage bonus dice into that roll.
- Weapon items now include editable Wielded, Parry Bonus, and Evade Bonus fields; wielded weapon bonuses appear in the Gear tab defense summary and defense rolls.

# v 0.1.6
## Chapter 3 foundations
- Bug fixes
- Added a packaged Kung Fu Techniques compendium with Chapter 3 Special, Stance, Waijia, Qinggong, Neigong, Dianxue, Profound, and Evil technique entries.
- Technique compendium entries include structured discipline, technique type, activation skill, Qi rank, damage, open-damage flag, counter marker, and item-specific Chapter 3 description text.
- Kung Fu Technique items can be used normally or Cathartically from the Martial tab using their Activation Skill.
- Cathartic use now awards printed Imbalance amounts, rolls Qi Spirit Possession at `12 + Qi`, tracks daily Meditation control, and supports printed no-roll meditation recovery.
- Removed the misleading Qi Cost field: techniques require the listed Qi Rank but do not spend Qi when used.
- Fixed Kung Fu Technique items failing to appear on the Martial tab after creation or drag and drop.
- Added Qi Duel round resolution against a targeted actor, including Qi/Neigong penalties, tied-round energy buildup, and Extra Wound application.
- Prevented duplicate Kung Fu Technique imports on a single drop and added first-use Activation Skill selection for unconfigured techniques.
- Kung Fu Technique rolls now resolve book-style activation strings like `Light Melee against Parry`, and blocked technique clicks now show visible errors instead of failing silently.
- Kung Fu Technique rolls now flush visible Skill item ranks before rolling, and successful techniques with parseable Damage dice roll a damage card with Apply Wounds.
- Technique activation rolls no longer inherit the Combat Round action bonus, so a 3-rank activation skill rolls 3d10 unless the technique or a future explicit modifier says otherwise.
- Technique Activation Skills are now stored and resolved with their skill group, so `Physical: Athletics`, `physical.athletics`, and older bare `athletics` values all resolve to the actor's owned Athletics Skill item.
- Kung Fu Technique rows now show their current damage dice on the Martial tab when the Damage field can be calculated from fixed dice, skill ranks, discipline ranks, or Qi rank.
- Purge Spirit now enforces Cathartic use, targets a possessed actor, purges the target on success, clears the target's Imbalance on Total Success, and applies its extra failure Imbalance.
- Purge Affliction now enforces Cathartic use, targets an actor with tracked Mental Affliction entries, purges one on success, purges up to two on Total Success, and applies its extra failure Imbalance.
- Added Mental Affliction as an affliction tracker category ahead of the full Chapter 4 mental-affliction compendium pass.
- Stance techniques now track an active stance on the Martial tab: normal stances assume as a Move Action without a roll, Cathartic stances roll normally, and active Cathartic stances expose a maintenance roll each round.
- Formation stances now carry structured participant counts and formation reminders in the compendium, item sheet, Martial tab, active stance panel, and stance chat cards.
- Counter techniques now label their normal action as Counter, remind users they are off-turn free actions, enforce Cathartic use against targeted attackers whose Qi equals or exceeds the user's Qi, and show trigger/Qi context in chat.
- Combination techniques now have structured prerequisite fields; I Am the Arrow is flagged as requiring Spear of the Infinite Emperor and Great Stride, and use is blocked until the actor knows both.
- Technique entries now show Requirement badges for table-state prerequisites such as substances, weather, intoxication, missing limbs, or other non-automated conditions.
- Technique damage now distinguishes normal Open Damage from Cathartic-only Open Damage, and obvious fixed Extra Wounds are added to technique damage cards.
- Technique item sheets now hide non-rule Cost and raw Counter fields, separate Cathartic effects, expose rolled-against/default TN fields, and support attack/damage modifiers.
- The Kung Fu Techniques compendium is now foldered by Tier, Discipline, and Qi Rank requirement for faster lookup.
- Secret techniques and lost/manual access notes now appear as technique item fields, Martial tab badges, and roll-card reminders.
- Technique rolls now enforce core Chapter 3 mastery requirements: listed Martial Discipline techniques require at least 1 rank in that Discipline, and Profound, Evil, and Immortal Techniques must be used Cathartically.
- The Martial tab now badges Cathartic-only techniques and techniques whose required Discipline rank is missing.
- Profound, Evil, and Immortal Technique Cathartic use now applies the Chapter 3 Imbalance Rating 2 rule instead of the actor's normal Imbalance Rating.
- Evil Techniques now show Demon Flaw reminders on the Martial tab and post a Demon Flaw Table reminder when first added to an actor.
- Added the Chapter 1 Demon Flaw Table as a Martial-tab `Roll Demon Flaw` helper for Evil Technique mastery.
- Cleaned Chapter 3 technique compendium text where generated entries had swallowed section headers or retained a PDF line-break hyphen.
- Successful Normal Damage techniques now post a follow-up damage reminder and can load their printed damage modifiers or fixed Extra Wounds into the actor's next weapon damage roll.
- Techniques with clear direct-Wound outcomes now show those values on the Martial tab and post an Apply Wounds chat card after successful use.
- Technique consequence fields now cover user Wound costs, consequence reminders, and special Cathartic Imbalance multipliers such as Merciless Black Claw.
- Chat Apply Wounds buttons no longer fall back to controlled tokens; generic damage now requires an explicit target, while target-aware damage cards remember the target selected when rolled.
- Technique items now support structured required Flaws and Skill-rank minimums, with use blocked for clear actor-known requirements such as Missing Limb or Medicine rank prerequisites.
- Techniques with clear temporary-drain outcomes now show Target Drain fields, post target-locked Apply Drain chat buttons on success, and seed obvious Hardiness/Qi drain reminders in the Chapter 3 compendium.
- Technique Target Effect reminders now cover common Chapter 3 state outcomes such as stunned, prone, drunk, passed out, paralyzed, frozen, limb injury, emotion removal, Mental Affliction prompts, and controlled actions.

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
- Prepared Strike weapon attacks now show the declared trigger/zone in chat and automatically clear the armed strike after the interrupt attack is rolled.
- Maiming and Disarm damage cards now show rule checklists for the GM instead of a single compressed reminder line.
- Charge and mounted helpers now validate straight-line movement, mounted charge follow-through, mounted bow penalties, mounted advantage reminders, and moving-mount Cathartic Imbalance.
- Dropped Skill items now keep their own primary skill group instead of being rewritten to whichever group panel they were dropped over.

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
	
