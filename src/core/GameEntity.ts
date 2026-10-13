export class GameEntity {
    protected readonly entityIdentifier: string;
    protected entityDisplayName: string;

    constructor(identifier: string, displayName: string) {
        this.entityIdentifier = identifier;
        this.entityDisplayName = displayName;
    }

    public getIdentifier(): string {
        return this.entityIdentifier;
    }

    public getDisplayName(): string {
        return this.entityDisplayName;
    }

    protected setDisplayName(displayName: string): void {
        this.entityDisplayName = displayName;
    }

    public describe(): string {
        return this.entityDisplayName;
    }
}
