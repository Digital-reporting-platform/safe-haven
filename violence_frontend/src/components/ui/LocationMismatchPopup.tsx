import { AlertTriangle, MapPin, Wifi, WifiOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

export interface LocationMismatchData {
  hasMismatch: boolean;
  detectedLocation: {
    country: string;
    region: string;
    city: string;
    isVpn: boolean;
    isProxy: boolean;
  };
  selectedRegion: string;
  message: string;
  isVpnOrProxy: boolean;
}

interface LocationMismatchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationData: LocationMismatchData | null;
  onConfirm: () => void;
  onCorrectLocation: () => void;
}

export function LocationMismatchPopup({
  open,
  onOpenChange,
  locationData,
  onConfirm,
  onCorrectLocation,
}: LocationMismatchPopupProps) {
  if (!locationData || !locationData.hasMismatch) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Location Difference Detected
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4 text-base">
            <div className="space-y-4">
              <p>
                Your current location appears different from the selected report location.
                Please confirm or update.
              </p>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-1 font-medium text-slate-500">Detected Location</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">
                        {locationData.detectedLocation.region || 'Unknown'}
                      </span>
                      {locationData.detectedLocation.isVpn && (
                        <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                          <Wifi className="h-3 w-3" /> VPN
                        </span>
                      )}
                      {locationData.detectedLocation.isProxy && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          <WifiOff className="h-3 w-3" /> Proxy
                        </span>
                      )}
                    </div>
                    {locationData.detectedLocation.city && locationData.detectedLocation.city !== 'Unknown' && (
                      <p className="mt-1 text-slate-600">{locationData.detectedLocation.city}</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-slate-500">Selected Region</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#C15B3E]" />
                      <span className="font-semibold">{locationData.selectedRegion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {locationData.isVpnOrProxy && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <strong>Note:</strong> A VPN or proxy connection was detected. This may explain
                  the location difference. Your report will still be submitted securely.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={onCorrectLocation} className="flex-1">
            Correct Location
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            Continue Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
