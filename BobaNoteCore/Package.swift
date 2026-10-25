// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "BobaNoteCore",
    platforms: [.iOS(.v18), .macOS(.v15)],
    products: [
        .library(name: "BobaNoteCore", targets: ["BobaNoteCore"]),
    ],
    targets: [
        .target(name: "BobaNoteCore"),
        .testTarget(name: "BobaNoteCoreTests", dependencies: ["BobaNoteCore"]),
    ]
)
