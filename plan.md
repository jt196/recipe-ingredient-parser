# Parser Improvement Plan (from parsed_ingredients.csv review)

Source: 134 annotated ingredient lines in `scripts/parsed_ingredients.csv`. Themes have been deduped into discrete work items with proposed tests and implementation notes. No code changes yet.

## Proposed Work Items

- [x] Approximation flag
- Examples: `about 2L ...`, `About 1/2 cup ...`, `~`, `roughly`, `approximately`.
- Plan: detect leading/inline approx tokens before quantity; add boolean `approx` (or `isApprox`) in parse result; strip token from ingredient text.
- Tests: `about 2L oil` -> `approx=true`, `quantity=2`, `unit=liter`, ingredient clean. `~1/4 cup sugar`, `roughly 3 tbsp butter`.
- Languages: add localized approx lists (eng/deu/ita etc.).

2) Optional / serving flags
- Examples: `optional`, `to serve`, `(optional)`, `Serving(s)/portion`.
- Plan: capture `optional` markers into a new flag field (e.g., `optional=true`) and keep ingredient clean; “serving(s)/portion” handling will be covered under units expansion (see #4).
- Tests: `1 cup cream (optional)` -> `optional=true`. `Fresh coriander, to serve` -> `servingUse=true`, ingredient `Fresh coriander`. `Serving suggestion:` should not be parsed as unit.

3) State / instruction extraction
- Examples: cold, warm/lukewarm/warmed, finely/thinly/coarsely, freshly ground/grated, diced/chopped/sliced/julienned/halved, crushed/minced/peeled/seeded/pitted/rinsed/drained/pressed/softened/melted/steamed/boiled/pan-fried, shredded, husked, leftover, whole, ripe.
- Plan: introduce `states` array (temperature/condition adjectives) and `instructions` array (prep verbs). Strip these from ingredient string but return them. Keep additional notes separate.
- Tests: `4 tbsp cold unsalted butter, cut into pieces` -> ingredient `unsalted butter`, instructions `[cut into pieces]`, states `[cold]`. `2 cloves garlic, crushed` -> state/instruction captured, ingredient `garlic`, unit `clove`.
- Languages: extend state/prep lists per language (eng/deu/ita).

4) Units expansion / normalization
- Missing or requested units: drops, squirt, dash, bunch, serving/portion, litre/millilitre variants, `t/s` abbreviation, `x` multiplicative marker, `ml`/`lts` variants.
- Plan: add to unit maps (singular/plural/symbol), normalize abbreviations (e.g., `t/s` -> teaspoon), ensure litre/millilitre parsed.
- Tests: `3 drops vanilla` -> unit `drop`; `1 bunch parsley` -> unit `bunch`; `t/s salt` -> teaspoon; `2L water` -> liter; `500ml stock` -> milliliter.

5) Alternate quantities/units/ingredients
- Examples: alternatives in parentheses or slashes: `1 cup (or 250ml)`, `1 pack / 16oz`, `old fashioned or instant oats`, `or` within ingredient, alternative units after `/`.
- Plan: capture alternates into a structured `alternatives` array (each with qty/unit/ingredient when parseable, or raw text fallback). Keep primary parse from first quantity/unit. Avoid treating “or” as main ingredient text.
- Tests: `1 cup oats (250 ml)` -> primary `1 cup oats`, alternatives includes `250 ml`; `2 cups oats or quinoa` -> ingredient `oats`, alternatives contains `quinoa`; `8 oz / 225g pasta` -> primary `8 ounce`, alternative `225 gram`.

6) Multiple numbers in one line
- Examples: `2 x 100 g`, `1 1.8kg chicken`, `1 (3-4) pieces`, `1 kilogram to 2 kilograms`.
- Plan: handle simple multiplier (`<n> x <qty>` => qty*n), tolerate compound ranges with parentheses and dual quantities; when ambiguous, preserve ingredient text cleanly and keep quantities as array? (proposal: new `secondaryQuantity` field or record multiplier).
- Tests: `2 x 100g tomatoes` -> quantity `200`, unit `gram`, ingredient `tomatoes`; `1 (3-4) pieces ginger` -> quantity `1`, additional/min-max range recorded separately; `1-2 kg pork shoulder` already works; ensure no “1/4-1/2” regression.

7) Brackets handling / nested brackets
- Examples: nested brackets, double brackets, bracketed instructions vs. alternates.
- Plan: make bracket parser take the outermost group and avoid nesting confusion; route bracket content either to `additional`, `alternatives`, or `instructions/states` based on tokens.
- Tests: `(optional) finely chopped parsley (for garnish)` -> optional flag, instructions `finely chopped`, ingredient `parsley`, additional `for garnish`. Nested `(14.5 oz (410g)) can tomatoes` -> additional captures both weights or alternative structure without breaking ingredient.

8) Ingredient-only anomalies and units-as-words
- Examples: `medium/large` not actual units; `inch` as ingredient vs unit; `piece of ginger` where “piece” is unit but “inch” is size; `pinch` merged into ingredient (`1 healthyeach`).
- Plan: tighten unit detection for adjectives (`small/medium/large` as state not unit); allow “piece” as unit but avoid “inch” as unit unless explicitly configured; when unit word appears inside ingredient, avoid concatenating with quantity.
- Tests: `1 large onion` -> state `large`, unit null; `1-inch piece ginger` -> unit `piece`, ingredient `ginger`, additional size `1-inch` captured maybe as state/note; `1 pinch salt` should not merge into ingredient string.

9) Alt units + system tagging
- Notes call for tagging primary/alternate units with system (US vol/metric/imperial) to aid UI.
- Plan: add metadata field `unitSystem` for primary and for `alternatives` entries.
- Tests: `1 cup (250 ml) milk` -> primary unitSystem `us_volume`, alternative `metric`. `8 oz / 225 g pasta` similar.

10) Error tolerance / messy lines
- Some lines are “ignore”/yuck; plan: add a failure note field? maybe `unparsedFragments` when multiple numbers/units remain.
- Tests: ensure parser does not throw on malformed lines; captures `unparsedFragments` array when leftovers remain after parse.

## Next Steps
- Confirm these work item buckets with you (esp. approx/optional/state separation and alternatives structure).
- After confirmation: implement incrementally with matching tests (English first, then extend to other languages where lookups apply), keeping regression suite green.***
