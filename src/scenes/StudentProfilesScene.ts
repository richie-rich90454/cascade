import Phaser from "phaser";

import { GameSession } from "../core/GameSession";
import { SceneKeys } from "../core/SceneKeys";
import { FontFamilies } from "../managers/FontManager";
import { LocalProfileManager } from "../managers/LocalProfileManager";
import { UiPalette } from "../ui/UiPalette";
import { PanelVariant, UiPanelFactory } from "../ui/UiPanelFactory";
import { UiScrollInput } from "../ui/UiScrollInput";

export class StudentProfilesScene extends Phaser.Scene {
    private activeDialogElement: HTMLElement | null;
    private dialogReturnFocus: HTMLElement | null;

    public constructor() {
        super({ key: SceneKeys.STUDENT_PROFILES });
        this.activeDialogElement = null;
        this.dialogReturnFocus = null;
    }

    public create(): void {
        const width = this.scale.width;
        const height = this.scale.height;
        const profiles = LocalProfileManager.getInstance().getProfiles();
        const activeProfile = LocalProfileManager.getInstance().getActiveProfile();
        this.add.rectangle(0, 0, width, height, UiPalette.NEAR_BLACK_LEATHER).setOrigin(0, 0);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.closeDialog);
        this.add.rectangle(0, 0, width, 100, UiPalette.DARK_OLIVE).setOrigin(0, 0).setAlpha(0.65);
        UiPanelFactory.createBrassButton(this, 24, 24, 150, 44, "BACK", () => this.scene.start(SceneKeys.MAIN_MENU));
        UiPanelFactory.createSectionHeader(this, 206, 30, "LOCAL STUDENT PROFILES", 28);

        const intro = this.add.text(
            32,
            120,
            "Each profile keeps its own campaigns, journal, and assessment progress on this device.",
            {
                fontFamily: FontFamilies.BODY_SERIF,
                fontSize: "18px",
                color: UiPalette.PARCHMENT_CSS,
                wordWrap: { width: width - 64 },
            },
        );
        void intro;

        const cardWidth = Math.min(700, width - 64);
        const listLeft = (width - cardWidth) / 2;
        const listTop = 180;
        const listHeight = Math.min(Math.max(150, height - 300), 520);
        UiPanelFactory.createPanelContainer(this, listLeft, listTop, cardWidth, listHeight, PanelVariant.LEATHER);
        const viewportTop = listTop + 14;
        const viewportHeight = Math.max(48, listHeight - 82);
        const rowsContainer = this.add.container(listLeft + 18, viewportTop);
        const maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(listLeft + 14, viewportTop, cardWidth - 28, viewportHeight);
        rowsContainer.setMask(maskGraphics.createGeometryMask());
        maskGraphics.setVisible(false);
        profiles.forEach((profile, index) => {
            const rowY = index * 94;
            const row = this.add.container(0, rowY);
            const isActive = profile.profileIdentifier === activeProfile.profileIdentifier;
            const hasCampaign = profile.campaign !== null;
            const description = `${profile.displayName}${isActive ? " · ACTIVE" : ""}${hasCampaign ? ` · CAMPAIGN SAVED AT CHAPTER ${profile.campaign?.turnManager.turnNumber}` : " · NO CAMPAIGN SAVE"}`;
            row.add(
                UiPanelFactory.createBrassButton(this, 0, 0, cardWidth - 36, 42, description, () => {
                    this.activateProfile(profile.profileIdentifier);
                }),
            );
            row.add(
                UiPanelFactory.createBrassButton(this, 0, 46, 128, 34, "RENAME", () => {
                    this.openNameDialog("Rename student profile", profile.displayName, "SAVE NAME", (nextName) => {
                        if (LocalProfileManager.getInstance().renameProfile(profile.profileIdentifier, nextName)) {
                            this.scene.restart();
                        } else {
                            this.showStatus(LocalProfileManager.getInstance().getRecoveryMessage());
                        }
                    });
                }),
            );
            row.add(
                UiPanelFactory.createBrassButton(this, 138, 46, 128, 34, "DELETE", () => {
                    if (profiles.length <= 1) {
                        this.showStatus("Keep at least one local student profile.");
                        return;
                    }
                    this.openConfirmDialog(
                        "Delete this profile?",
                        `Delete ${profile.displayName} and its saved campaigns, journal, and assessment records from this browser?`,
                        "DELETE PROFILE",
                        () => {
                            const profileManager = LocalProfileManager.getInstance();
                            if (profile.profileIdentifier === profileManager.getActiveProfile().profileIdentifier) {
                                const nextProfile = profiles.find(
                                    (candidate) => candidate.profileIdentifier !== profile.profileIdentifier,
                                );
                                if (
                                    nextProfile === undefined ||
                                    !GameSession.getInstance().switchToProfile(nextProfile.profileIdentifier)
                                ) {
                                    this.showStatus(profileManager.getRecoveryMessage());
                                    return;
                                }
                            }
                            if (profileManager.deleteProfile(profile.profileIdentifier)) {
                                this.scene.restart();
                            } else {
                                this.showStatus(profileManager.getRecoveryMessage());
                            }
                        },
                    );
                }),
            );
            rowsContainer.add(row);
        });

        let scrollOffset = 0;
        const maxScrollOffset = Math.max(0, profiles.length * 94 - viewportHeight);
        const onWheel = (
            pointer: Phaser.Input.Pointer,
            _currentlyOver: Phaser.GameObjects.GameObject[],
            _deltaX: number,
            deltaY: number,
        ): void => {
            const pointerPosition = UiScrollInput.getCssPointerPosition(pointer);
            if (
                pointerPosition.x < listLeft ||
                pointerPosition.x > listLeft + cardWidth ||
                pointerPosition.y < viewportTop ||
                pointerPosition.y > viewportTop + viewportHeight
            ) {
                return;
            }
            scrollOffset = Phaser.Math.Clamp(
                scrollOffset + UiScrollInput.getWheelDeltaPx(pointer, deltaY, viewportHeight),
                0,
                maxScrollOffset,
            );
            rowsContainer.y = viewportTop - scrollOffset;
        };
        this.input.on("wheel", onWheel);
        const onPageDown = (): void => {
            scrollOffset = Phaser.Math.Clamp(scrollOffset + viewportHeight * 0.8, 0, maxScrollOffset);
            rowsContainer.y = viewportTop - scrollOffset;
        };
        const onPageUp = (): void => {
            scrollOffset = Phaser.Math.Clamp(scrollOffset - viewportHeight * 0.8, 0, maxScrollOffset);
            rowsContainer.y = viewportTop - scrollOffset;
        };
        this.input.keyboard?.on("keydown-PAGEDOWN", onPageDown);
        this.input.keyboard?.on("keydown-PAGEUP", onPageUp);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("wheel", onWheel);
            this.input.keyboard?.off("keydown-PAGEDOWN", onPageDown);
            this.input.keyboard?.off("keydown-PAGEUP", onPageUp);
            maskGraphics.destroy();
        });

        if (profiles.length * 94 > viewportHeight) {
            const scrollHint = this.add.text(
                listLeft + cardWidth - 20,
                listTop + listHeight - 68,
                "SCROLL OR USE PAGE UP / PAGE DOWN",
                {
                    fontFamily: FontFamilies.TYPEWRITER_BODY,
                    fontSize: "12px",
                    color: UiPalette.AGED_PARCHMENT_CSS,
                },
            );
            scrollHint.setOrigin(1, 0);
        }

        UiPanelFactory.createBrassButton(
            this,
            listLeft + 18,
            listTop + listHeight - 58,
            cardWidth - 36,
            44,
            "ADD STUDENT PROFILE",
            () => {
                this.openNameDialog("Add student profile", "", "CREATE PROFILE", (newName) => {
                    const newProfile = LocalProfileManager.getInstance().createProfile(newName);
                    if (newProfile === null) {
                        this.showStatus(LocalProfileManager.getInstance().getRecoveryMessage());
                        return;
                    }
                    GameSession.getInstance().clearActiveSession();
                    GameSession.getInstance().getAssessmentManager().restoreSnapshot(newProfile.assessment);
                    this.scene.restart();
                });
            },
        );

        const recoveryMessage = LocalProfileManager.getInstance().getRecoveryMessage();
        this.showStatus(
            recoveryMessage ||
                (LocalProfileManager.getInstance().canSaveLocally()
                    ? `Active profile: ${activeProfile.displayName}. Saves update automatically after each completed action.`
                    : "Local saving is unavailable in this browser. Progress will last only until this tab closes."),
        );
        this.input.keyboard?.once("keydown-ESC", () => this.scene.start(SceneKeys.MAIN_MENU));
    }

    private activateProfile(profileIdentifier: string): void {
        const activeIdentifier = LocalProfileManager.getInstance().getActiveProfile().profileIdentifier;
        if (activeIdentifier !== profileIdentifier && !GameSession.getInstance().switchToProfile(profileIdentifier)) {
            this.showStatus(LocalProfileManager.getInstance().getRecoveryMessage());
            return;
        }
        this.scene.start(SceneKeys.MAIN_MENU);
    }

    private showStatus(message: string): void {
        if (message.length === 0) {
            return;
        }
        const status = this.add.text(this.scale.width / 2, this.scale.height - 46, message, {
            fontFamily: FontFamilies.BODY_SERIF,
            fontSize: "16px",
            color: UiPalette.HIGHLIGHT_BRASS_CSS,
            align: "center",
            wordWrap: { width: this.scale.width - 64 },
        });
        status.setOrigin(0.5, 0.5);
    }

    private openNameDialog(
        title: string,
        initialValue: string,
        confirmLabel: string,
        onSubmit: (name: string) => void,
    ): void {
        this.closeDialog();
        const overlay = document.createElement("div");
        overlay.className = "profile-dialog-backdrop";
        const form = document.createElement("form");
        form.className = "profile-dialog";
        form.setAttribute("role", "dialog");
        form.setAttribute("aria-modal", "true");
        const heading = document.createElement("h2");
        heading.id = "profile-dialog-title";
        heading.textContent = title;
        const description = document.createElement("p");
        description.textContent = "Names are saved only in this browser and may contain up to 30 characters.";
        const label = document.createElement("label");
        label.textContent = "Student name";
        const input = document.createElement("input");
        input.id = "profile-dialog-name";
        input.type = "text";
        input.name = "studentName";
        input.maxLength = 30;
        input.required = true;
        input.value = initialValue;
        const actions = document.createElement("div");
        actions.className = "profile-dialog-actions";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "CANCEL";
        const confirm = document.createElement("button");
        confirm.type = "submit";
        confirm.textContent = confirmLabel;
        actions.append(cancel, confirm);
        form.append(heading, description, label, input, actions);
        form.setAttribute("aria-labelledby", heading.id);
        label.htmlFor = input.id;
        overlay.append(form);
        this.activeDialogElement = overlay;
        this.dialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.append(overlay);
        input.focus();
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = input.value.trim().replace(/\s+/g, " ");
            if (name.length === 0) {
                input.setCustomValidity("Enter a student name.");
                input.reportValidity();
                return;
            }
            input.setCustomValidity("");
            this.closeDialog();
            onSubmit(name);
        });
        input.addEventListener("input", () => input.setCustomValidity(""));
        cancel.addEventListener("click", () => this.closeDialog());
        overlay.addEventListener("keydown", (event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
                this.closeDialog();
                return;
            }
            if (event.key === "Tab") {
                const focusableControls = [input, cancel, confirm];
                const first = focusableControls[0];
                const last = focusableControls[focusableControls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    private openConfirmDialog(
        title: string,
        descriptionText: string,
        confirmLabel: string,
        onConfirm: () => void,
    ): void {
        this.closeDialog();
        const overlay = document.createElement("div");
        overlay.className = "profile-dialog-backdrop";
        const dialog = document.createElement("section");
        dialog.className = "profile-dialog";
        dialog.setAttribute("role", "alertdialog");
        dialog.setAttribute("aria-modal", "true");
        const heading = document.createElement("h2");
        heading.id = "profile-dialog-title";
        heading.textContent = title;
        const description = document.createElement("p");
        description.textContent = descriptionText;
        const actions = document.createElement("div");
        actions.className = "profile-dialog-actions";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "CANCEL";
        const confirm = document.createElement("button");
        confirm.type = "button";
        confirm.className = "danger";
        confirm.textContent = confirmLabel;
        actions.append(cancel, confirm);
        dialog.append(heading, description, actions);
        dialog.setAttribute("aria-labelledby", heading.id);
        overlay.append(dialog);
        this.activeDialogElement = overlay;
        this.dialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.append(overlay);
        cancel.focus();
        cancel.addEventListener("click", () => this.closeDialog());
        confirm.addEventListener("click", () => {
            this.closeDialog();
            onConfirm();
        });
        overlay.addEventListener("keydown", (event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
                this.closeDialog();
                return;
            }
            if (event.key === "Tab") {
                const first = cancel;
                const last = confirm;
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    private closeDialog = (): void => {
        this.activeDialogElement?.remove();
        this.activeDialogElement = null;
        this.dialogReturnFocus?.focus();
        this.dialogReturnFocus = null;
    };
}
