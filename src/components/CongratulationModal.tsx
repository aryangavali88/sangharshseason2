import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles } from "lucide-react";

interface CongratulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  teamName: string;
  bidAmount: number;
}

const CongratulationModal = ({ 
  isOpen, 
  onClose, 
  playerName, 
  teamName, 
  bidAmount 
}: CongratulationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
              <Badge variant="secondary" className="text-lg px-4 py-2">
                SOLD!
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-lg font-semibold">{playerName}</p>
              <p className="text-muted-foreground">has been sold to</p>
              <p className="text-xl font-bold text-primary">{teamName}</p>
              <p className="text-2xl font-bold text-green-600">
                {bidAmount.toLocaleString()} Points
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationModal;