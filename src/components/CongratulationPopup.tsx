import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles } from "lucide-react";

interface CongratulationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  teamName: string;
  bidAmount: number;
  playerImage?: string;
}

const CongratulationPopup = ({
  isOpen,
  onClose,
  playerName,
  teamName,
  bidAmount,
  playerImage
}: CongratulationPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <Card className="border-none shadow-none">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-500" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Congratulations!</h2>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                SOLD!
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-xl font-semibold">{playerName}</h3>
                <p className="text-muted-foreground">has been sold to</p>
                <p className="text-lg font-bold text-primary">{teamName}</p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Final Bid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {bidAmount.toLocaleString()} Points
                </p>
              </div>
            </div>

            <Button 
              onClick={onClose}
              className="w-full mt-6"
            >
              Continue Auction
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationPopup;