import Testing
import BobaNoteCore

@Test func normalizedIgnoresCaseAndExtraWhitespace() {
    #expect(DrinkName.normalized("  Brown  Sugar\tMilk Tea ") == "brown sugar milk tea")
}

@Test func normalizedKeepsDifferentDrinksApart() {
    #expect(DrinkName.normalized("Taro Milk Tea") != DrinkName.normalized("Taro Milk"))
}
