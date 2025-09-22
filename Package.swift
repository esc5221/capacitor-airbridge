// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorPluginAirbridge",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapacitorPluginAirbridge",
            targets: ["AirbridgePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        .package(url: "https://github.com/ab180/airbridge-ios-sdk-deployment.git", from: "4.7.0")
    ],
    targets: [
        .target(
            name: "AirbridgePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "Airbridge", package: "airbridge-ios-sdk-deployment")
            ],
            path: "ios/Sources/AirbridgePlugin"),
        .testTarget(
            name: "AirbridgePluginTests",
            dependencies: ["AirbridgePlugin"],
            path: "ios/Tests/AirbridgePluginTests")
    ]
)