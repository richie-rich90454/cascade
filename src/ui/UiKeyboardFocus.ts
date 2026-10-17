import Phaser from "phaser";

interface KeyboardFocusableControl {
    container: Phaser.GameObjects.Container;
    setFocused: (isFocused: boolean) => void;
    activate: () => void;
}

export class UiKeyboardFocus {
    private static readonly managers = new WeakMap<Phaser.Scene, SceneKeyboardFocusManager>();

    public static register(
        scene: Phaser.Scene,
        control: KeyboardFocusableControl,
    ): { focus: () => void } {
        let manager = UiKeyboardFocus.managers.get(scene);
        if (manager === undefined) {
            manager = new SceneKeyboardFocusManager(scene);
            UiKeyboardFocus.managers.set(scene, manager);
        }
        return manager.register(control);
    }

    public static hasFocus(scene: Phaser.Scene): boolean {
        return UiKeyboardFocus.managers.get(scene)?.hasFocus() ?? false;
    }

    public static clear(scene: Phaser.Scene): void {
        UiKeyboardFocus.managers.delete(scene);
    }
}

class SceneKeyboardFocusManager {
    private readonly scene: Phaser.Scene;
    private controls: KeyboardFocusableControl[];
    private focusedControl: KeyboardFocusableControl | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.controls = [];
        this.focusedControl = null;
        scene.input.keyboard?.on("keydown", this.handleKeyDown);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);
    }

    public register(control: KeyboardFocusableControl): { focus: () => void } {
        this.pruneDestroyedControls();
        this.controls.push(control);
        return { focus: () => this.setFocusedControl(control) };
    }

    public hasFocus(): boolean {
        if (this.focusedControl === null || !this.isControlVisible(this.focusedControl)) {
            return false;
        }
        return true;
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }
        const visibleControls = this.getVisibleControls();
        if (visibleControls.length === 0) {
            this.setFocusedControl(null);
            return;
        }
        if (event.key === "Tab") {
            event.preventDefault();
            const currentIndex = this.focusedControl === null ? -1 : visibleControls.indexOf(this.focusedControl);
            const nextIndex = event.shiftKey
                ? currentIndex <= 0
                    ? visibleControls.length - 1
                    : currentIndex - 1
                : (currentIndex + 1) % visibleControls.length;
            this.setFocusedControl(visibleControls[nextIndex]);
            return;
        }
        if ((event.key === "Enter" || event.key === " ") && this.focusedControl !== null) {
            event.preventDefault();
            if (this.isControlVisible(this.focusedControl)) {
                this.focusedControl.activate();
            }
        }
    };

    private handleShutdown = (): void => {
        this.scene.input.keyboard?.off("keydown", this.handleKeyDown);
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);
        this.controls.forEach((control) => control.setFocused(false));
        this.controls = [];
        this.focusedControl = null;
        UiKeyboardFocus.clear(this.scene);
    };

    private getVisibleControls(): KeyboardFocusableControl[] {
        this.pruneDestroyedControls();
        return this.controls.filter((control) => this.isControlVisible(control));
    }

    private isControlVisible(control: KeyboardFocusableControl): boolean {
        let currentContainer: Phaser.GameObjects.Container | null = control.container;
        while (currentContainer !== null) {
            if (!currentContainer.active || !currentContainer.visible) {
                return false;
            }
            currentContainer = currentContainer.parentContainer;
        }
        return true;
    }

    private pruneDestroyedControls(): void {
        const activeControls = this.controls.filter((control) => control.container.active);
        if (activeControls.length !== this.controls.length) {
            if (this.focusedControl !== null && !activeControls.includes(this.focusedControl)) {
                this.focusedControl.setFocused(false);
                this.focusedControl = null;
            }
            this.controls = activeControls;
        }
    }

    private setFocusedControl(control: KeyboardFocusableControl | null): void {
        if (this.focusedControl === control) {
            return;
        }
        this.focusedControl?.setFocused(false);
        this.focusedControl = control;
        this.focusedControl?.setFocused(true);
    }
}

