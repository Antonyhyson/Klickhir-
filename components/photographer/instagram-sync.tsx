// antonyhyson/Klickhiré/Klickhiré-bc73fc2893e84ce2bf95362a5017ca47ad2e1248/components/photographer/instagram-sync.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Instagram, Loader2, Link2, Unlink } from "lucide-react"

interface InstagramPhoto {
  id: string
  caption: string
  url: string
}

interface InstagramSyncProps {
  onPhotosSelect: (photos: InstagramPhoto[]) => void
  isSubmitting: boolean
  portfolioImages: string[] // The current portfolio image URLs
}

export function InstagramSync({ onPhotosSelect, isSubmitting, portfolioImages }: InstagramSyncProps) {
  const [isInstagramConnected, setIsInstagramConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<InstagramPhoto[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<InstagramPhoto[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Sync the selectedPhotos with the current images in the portfolio
    const syncedPhotos = photos.filter(photo => portfolioImages.includes(photo.url));
    setSelectedPhotos(syncedPhotos);
  }, [photos, portfolioImages]);

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate Instagram auth and fetching photos
      const response = await fetch("/api/instagram")
      if (!response.ok) {
        throw new Error("Failed to connect to Instagram. Please try again.")
      }
      const data = await response.json()
      setPhotos(data.photos)
      setIsInstagramConnected(true)
      // Automatically select photos if they are already in the portfolio
      const syncedPhotos = data.photos.filter((photo: InstagramPhoto) => portfolioImages.includes(photo.url));
      setSelectedPhotos(syncedPhotos);
    } catch (e: any) {
      console.error("Instagram sync error:", e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsInstagramConnected(false)
    setPhotos([])
    setSelectedPhotos([])
    setError(null)
  }

  const handlePhotoSelect = (photo: InstagramPhoto, checked: boolean) => {
    let newSelectedPhotos = checked
      ? [...selectedPhotos, photo]
      : selectedPhotos.filter((p) => p.id !== photo.id);

    setSelectedPhotos(newSelectedPhotos);
    onPhotosSelect(newSelectedPhotos); // Propagate the change to the parent
  };


  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-4 text-gray-500">Connecting to Instagram...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500 bg-red-50">
        <CardContent className="p-6 text-center text-red-700">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={handleConnect}>
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Instagram className="h-6 w-6 text-pink-600" />
          <CardTitle>Instagram Portfolio</CardTitle>
        </div>
        {!isInstagramConnected ? (
          <Button onClick={handleConnect} disabled={isSubmitting}>
            <Link2 className="h-4 w-4 mr-2" /> Connect Instagram
          </Button>
        ) : (
          <Button onClick={handleDisconnect} variant="outline" disabled={isSubmitting}>
            <Unlink className="h-4 w-4 mr-2" /> Disconnect
          </Button>
        )}
      </CardHeader>
      {isInstagramConnected && (
        <CardContent>
          <CardDescription className="mb-4">
            Select which of your latest Instagram posts you want to feature on your Klickhiré portfolio.
          </CardDescription>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {photos.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No photos found on your Instagram feed.</p>
            ) : (
              photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img src={photo.url} alt={photo.caption} className="w-full aspect-square object-cover rounded-md" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <Label htmlFor={`ig-photo-${photo.id}`} className="absolute top-2 right-2 text-white">
                      <Checkbox
                        id={`ig-photo-${photo.id}`}
                        checked={selectedPhotos.some(p => p.id === photo.id)}
                        onCheckedChange={(checked) => handlePhotoSelect(photo, checked as boolean)}
                        disabled={isSubmitting}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </Label>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}