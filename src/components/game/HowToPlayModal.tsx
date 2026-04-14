import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface HowToPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowToPlayModal({ open, onOpenChange }: HowToPlayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-widest text-foreground">
            HOW TO PLAY
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-body">
            Learn the rules of Black Hole
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 font-body text-sm text-foreground/90">
          <section>
            <h3 className="font-display text-xs tracking-widest text-primary mb-1">OVERVIEW</h3>
            <p>
              Black Hole is a strategy game played on a triangular board. Players take turns placing numbered tokens on empty tiles. The goal is to finish with the <strong>lowest score</strong>.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xs tracking-widest text-primary mb-1">TURN ORDER</h3>
            <p>
              Each player must place their tokens in <strong>ascending order</strong>, starting from 1. You cannot skip numbers — place 1 first, then 2, then 3, and so on.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xs tracking-widest text-primary mb-1">THE BLACK HOLE</h3>
            <p>
              After all players have placed their tokens, exactly one tile remains empty — this is the <strong>Black Hole</strong>. It pulls in all adjacent tokens!
            </p>
          </section>

          <section>
            <h3 className="font-display text-xs tracking-widest text-primary mb-1">SCORING</h3>
            <p>
              Your score is the <strong>sum of your token values</strong> on tiles adjacent to the Black Hole. The player with the <strong>lowest score wins</strong> — so try to keep your high-value tokens away from danger!
            </p>
          </section>

          <section>
            <h3 className="font-display text-xs tracking-widest text-primary mb-1">BOARD SIZE</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>2 players → 6 rows (21 tiles, tokens 1–10)</li>
              <li>3 players → 7 rows (28 tiles, tokens 1–9)</li>
              <li>4 players → 9 rows (45 tiles, tokens 1–11)</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
