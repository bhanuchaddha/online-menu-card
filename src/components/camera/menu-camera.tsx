'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, RotateCcw, Check, X } from 'lucide-react'

interface MenuCameraProps {
  onCapture: (imageSrc: string) => void
  onCancel?: () => void
}

export function MenuCamera({ onCapture, onCancel }: MenuCameraProps) {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  
  // TEMPORARY OVERRIDE: Auto-load test menu image
  // To revert to camera: comment out this useEffect block and remove useEffect from imports
  useEffect(() => {
    const loadMenuImage = async () => {
      try {
        const response = await fetch('/menu.jpg')
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result && typeof reader.result === 'string') {
            setCapturedImage(reader.result)
          }
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error('Failed to load menu.jpg:', error)
      }
    }
    
    loadMenuImage()
  }, [])

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
    }
  }, [webcamRef])

  const retake = () => {
    setCapturedImage(null)
  }

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  }

  return (
    <Card className="p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Menu Photo</h3>
          <p className="text-sm text-muted-foreground">
            {capturedImage ? 'Test menu loaded - click "Use Photo" to extract menu data' : 'Position your menu in the frame and tap capture'}
          </p>
        </div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured menu" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex justify-center gap-4">
          {capturedImage ? (
            // Captured state buttons
            <>
              <Button variant="outline" onClick={retake}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button onClick={confirm}>
                <Check className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
            </>
          ) : (
            // Camera state buttons
            <>
              <Button variant="outline" onClick={switchCamera}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Flip Camera
              </Button>
              <Button onClick={capture} size="lg">
                <Camera className="w-5 h-5 mr-2" />
                Capture
              </Button>
            </>
          )}
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
