import Foundation
import AVFoundation
import AppKit

let src = URL(fileURLWithPath: "/Users/husnainshakir/Desktop/badr-mobile-app/.tmp_sticky_frames/source.mp4")
let dst = URL(fileURLWithPath: "/Users/husnainshakir/Desktop/badr-mobile-app/.tmp_sticky_frames/exported.mp4")
try? FileManager.default.removeItem(at: dst)
let asset = AVURLAsset(url: src)
print("presets", AVAssetExportSession.exportPresets(compatibleWith: asset))
guard let session = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetPassthrough) ?? AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetMediumQuality) else {
  fputs("no session\n", stderr); exit(1)
}
// Prefer a re-encode preset that works
let session2 = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetHighestQuality)
let exporter = session2 ?? session
exporter.outputURL = dst
exporter.outputFileType = .mp4
let sem = DispatchSemaphore(value: 0)
exporter.exportAsynchronously {
  print("status", exporter.status.rawValue, "error", String(describing: exporter.error))
  sem.signal()
}
_ = sem.wait(timeout: .now() + 180)
print("exported exists", FileManager.default.fileExists(atPath: dst.path), "size", (try? FileManager.default.attributesOfItem(atPath: dst.path)[.size]) as Any)

// If export worked, pull frames
if FileManager.default.fileExists(atPath: dst.path) {
  let outAsset = AVURLAsset(url: dst)
  let gen = AVAssetImageGenerator(asset: outAsset)
  gen.appliesPreferredTrackTransform = true
  gen.maximumSize = CGSize(width: 720, height: 1280)
  let duration = CMTimeGetSeconds(outAsset.duration)
  print("duration", duration)
  for i in 0..<12 {
    let t = duration * Double(i) / 11.0
    do {
      var actual = CMTime.zero
      let cg = try gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: &actual)
      let rep = NSBitmapImageRep(cgImage: cg)
      let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.85])
      try data?.write(to: URL(fileURLWithPath: "/Users/husnainshakir/Desktop/badr-mobile-app/.tmp_sticky_frames/frame_\(String(format: "%02d", i)).jpg"))
      print("frame", i, "ok")
    } catch {
      print("frame", i, "fail", error)
    }
  }
}
