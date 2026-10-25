import SwiftUI
import BobaNoteCore

struct ContentView: View {
    private let commit = Bundle.main.object(forInfoDictionaryKey: "BobaNoteCommit") as? String ?? "unknown"

    var body: some View {
        VStack {
            Image(systemName: "takeoutbag.and.cup.and.straw.fill")
                .font(.largeTitle)
            Text("Boba Note")
                .font(.largeTitle.bold())
            Text("Build \(commit)")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    ContentView()
}
