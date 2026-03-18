import fs from 'fs';

const data = `Almond Butter Creamy	645.5	20.79	53.04	21.24
Almond Milk	14.5	0.55	1.22	0.34
Amaranth Flour	384.1	13.21	6.24	68.78
American Cheese Pasteurized Process	368.5	18.0	30.6	5.27
American Pasteurized Prepared Cheese Product With Added Vitamin D Sliced Individually Wrapped	368.5	18.0	30.6	5.27
American Pasteurized Process Cheese Food Sliced Individually Wrapped	309.8	15.57	23.86	8.19
American Pasteurized Process Cheese Food With Added Vitamin D Sliced Individually Wrapped	368.5	18.0	30.6	5.27
American Pasteurized Process Cheese Product Sliced Individually Wrapped	309.8	15.57	23.86	8.19
Apple Juice	48.4	0.09	0.29	11.36
Applesauce	51.6	0.27	0.16	12.26
Apricot	48.4	0.96	0.4	10.24
Apricot Pitted	48.4	0.96	0.4	10.24
Arugula	31.0	1.65	0.32	5.37
Asparagus	28.1	1.44	0.22	5.1
Aubergine	29.4	1.0	0.2	5.9
Avocado	223.3	1.81	20.31	8.32
Beef Breakfast Sausage	325.0	13.3	28.7	3.37
Beef Breakfast Sausage Banquet Brown N Serve Sausage Links Maple Flavor	325.0	13.3	28.7	3.37
Beef Breakfast Sausage Eckrich Sausage Links	325.0	13.3	28.7	3.37
Beets	44.6	1.69	0.3	8.79
Belly Pork	380.5	15.2	35.83	-0.7
Bison Ground	158.8	19.88	8.88	-0.15
Black Canned Beans	118.3	6.91	1.27	19.81
Black Unenriched Rice	370.0	7.57	3.44	77.19
Black-Eyed Pea Canned Beans	185.0	23.6	1.26	19.81
Black-Eyed Pea Canned Sodium Added	116.1	6.92	1.3	19.17
Black-Eyed Pea Dried	354.0	21.22	2.42	61.84
Blackberries	67.2	1.53	0.31	14.57
Blueberries	63.9	0.7	0.31	14.57
Bok Choy Regular (Not Baby)	20.2	1.02	0.23	3.51
Brazil Nuts	663.6	15.04	57.43	21.64
Broccoli	38.5	2.57	0.34	6.29
Brown Dried Lentils	360.2	23.57	1.92	62.17
Brown Long Grain Rice	365.6	7.25	3.31	76.69
Brown Rice Long Grain Unenriched	365.6	7.25	3.31	76.69
Brussels Sprouts	59.4	3.98	0.56	9.62
Buckwheat Dry	369.8	13.3	3.4	71.5
Buckwheat Flour	356.2	11.07	3.04	71.13
Buckwheat Whole Grain	356.2	11.07	3.04	71.13
Bulgur Dried	372.3	11.76	2.42	75.88
Butter Stick Salted	739.8	0.0	82.2	0.0
Butter Stick Unsalted	733.5	0.0	81.5	0.0
Buttermilk	42.8	3.46	1.08	4.81
Cabbage Bok Choy	20.2	1.02	0.23	3.51
Cabbage Green	31.4	0.96	0.23	6.38
Cabbage Napa Leaf	31.8	1.06	0.23	6.38
Cabbage Red	34.0	1.24	0.21	6.79
Canned Diced Tomatoes	27.0	0.85	0.45	4.9
Canned Red Tomatoes	21.1	0.84	0.5	3.32
Canned Tuna	84.8	19.0	0.94	0.08
Cannellini Canned Beans	115.4	7.41	1.17	18.82
Cannellini Dried Beans	345.2	21.56	2.2	59.8
Canola Oil	900.0	0.0	100.0	0.0
Cantaloupe	37.5	0.82	0.18	8.16
Carrots Baby	40.8	0.8	0.14	9.08
Carrots Frozen Unprepared	39.2	0.81	0.47	7.92
Carrots Mature	48.0	0.94	0.35	10.27
Cashews	564.7	17.44	38.86	36.29
Cassava Flour	357.3	0.92	0.49	87.31
Catfish	131.7	16.47	7.31	0.0
Cauliflower	27.6	1.64	0.24	4.72
Celery	16.7	0.49	0.16	3.32
Cheddar Cheese	409.0	23.3	34.0	2.44
Cheddar Cheese Sliced	409.0	23.3	34.0	2.44
Cheddar Natural Shredded Mild Cheese	321.0	22.62	24.3	2.96
Cheddar Natural Shredded Sharp Cheese	321.0	22.62	24.3	2.96
Cherries Dark Red Sweet	70.5	1.04	0.19	16.16
Cherries Sweet Dark Red	70.5	1.04	0.19	16.16
Chestnut Flour	384.7	5.29	4.64	80.45
Chia Seeds Dried	517.1	17.01	32.89	38.27
Chia Seeds Whole Dried	517.1	17.01	32.89	38.27
Chicken Breast	126.9	21.41	4.78	-0.43
Chicken Drumstick	125.0	18.36	5.94	-0.48
Chicken Thigh	187.9	17.11	13.35	-0.17
Chicken Wing	167.6	18.41	10.64	-0.46
Chickpeas	383.0	21.28	6.27	60.36
Chickpeas Canned	137.3	7.02	3.1	20.32
Chickpeas Canned Beans	185.0	23.6	1.26	19.81
Chickpeas Dried Beans	185.0	23.6	1.26	19.81
Chop Center Cut Pork	138.3	22.81	5.48	-0.56
Chorizo Pork Sausage	340.6	19.3	28.1	2.63
Chorizo Pork Sausage Johnsonville	340.6	19.3	28.1	2.63
Chuck Roast Beef	234.7	18.4	17.8	0.22
Coconut Flour	437.7	16.14	15.28	58.9
Coconut Oil	900.0	0.0	100.0	0.0
Cod	70.3	16.07	0.67	0.0
Collards	46.9	2.97	0.77	7.02
Cookies Oatmeal Soft	430.3	5.79	14.3	69.6
Corn Flour Masa Harina White	376.1	7.56	4.34	76.69
Corn Flour Masa Harina White Or Yellow	376.1	7.56	4.34	76.69
Corn Flour Masa Harina Yellow	376.1	7.56	4.34	76.69
Corn Oil	900.0	0.0	100.0	0.0
Cotija Cheese	321.0	22.62	24.3	2.96
Cotija Solid Cheese	351.4	23.84	27.24	2.72
Cottage Cheese	81.9	11.0	2.3	4.31
Cottage Cheese Large Curd	102.9	11.62	4.22	4.6
Cottage Cheese Large Or Small Curd	102.9	11.62	4.22	4.6
Cottage Cheese Small Curd	102.9	11.62	4.22	4.6
Courgette	19.9	1.2	0.3	3.1
Crab	81.9	18.65	0.81	0.0
Cranberry Juice	32.1	0.0	0.34	7.26
Cream Cheese Block	342.8	5.79	33.49	4.56
Cream Heavy	343.3	2.02	35.56	3.8
Cream Sour	196.4	3.07	17.99	5.56
Crimini Mushrooms	37.6	2.65	0.28	6.12
Crushed Canned Tomatoes	37.9	1.44	0.4	7.14
Cucumber	15.9	0.62	0.18	2.95
Diced Canned Tomatoes	27.0	0.85	0.45	4.9
Dried Black Beans	189.9	24.4	1.45	19.81
Dried Brown Beans	191.7	25.6	1.12	19.81
Dried Carioca Beans	193.0	25.2	1.44	19.81
Dried Cranberry Beans	187.9	24.4	1.23	19.81
Dried Dark Red Kidney Beans	194.6	25.9	1.31	19.81
Dried Flor De Mayo Beans	180.2	23.3	0.86	19.81
Dried Great Northern Beans	189.2	24.7	1.24	19.81
Dried Lentils	360.2	23.57	1.92	62.17
Dried Light Red Kidney Beans	188.5	25.0	1.03	19.81
Dried Light Tan Beans	189.2	24.6	1.28	19.81
Dried Medium Red Beans	190.6	25.5	1.04	19.81
Dried Navy Beans	189.2	24.1	1.51	19.81
Dried Pink Beans	183.6	23.4	1.2	19.81
Dried Pinto Beans	185.2	23.7	1.24	19.81
Dried Red Beans	174.9	21.3	1.16	19.81
Dried Salted Almonds	666.6	20.4	57.8	16.2
Dried Small Red Beans	184.8	23.5	1.28	19.81
Dried Small White Beans	189.1	24.5	1.32	19.81
Dried Tan Beans	196.7	26.8	1.14	19.81
Dried White Queso Seco Cheese	325.0	24.5	24.3	2.07
Eggplant	26.1	0.85	0.12	5.4
Eggplant Italian	26.1	0.85	0.12	5.4
Einkorn Grain Dried	369.4	15.12	3.81	68.65
Einkorn Grain Wheat Berry	369.4	15.12	3.81	68.65
Enoki Mushrooms	37.6	2.65	0.28	6.12
Eye Of Round Roast/Steak Beef	144.3	21.32	6.46	0.22
Farro Pearled Dried	367.0	12.64	3.1	72.13
Feta Whole Milk Crumbled Cheese	272.9	19.71	19.08	5.58
Figs	277.1	3.3	0.92	63.9
Figs Dried Uncooked	277.1	3.3	0.92	63.9
Figs Mission Dried	277.1	3.3	0.92	63.9
Flank Steak Beef	144.3	21.32	6.46	0.22
Flaxseed Ground	545.1	18.04	37.28	34.36
Flour	357.1	11.4	1.52	74.45
Flour All-Purpose	365.8	11.15	2.47	74.73
Flour All-Purpose (Unenriched)	365.8	11.15	2.47	74.73
Flour Almond	622.0	26.24	50.23	16.25
Flour Almond Blanched	365.8	11.15	2.47	74.73
Flour Amaranth	384.1	13.21	6.24	68.78
Flour Barley	366.5	8.72	2.45	77.4
Flour Bread White	363.2	14.3	1.65	72.8
Flour Bread White (Enriched)	365.8	11.15	2.47	74.73
Flour Buckwheat	357.9	8.88	2.48	75.02
Flour Cassava	357.3	0.92	0.49	87.31
Flour Chestnut	384.7	5.29	4.64	80.45
Flour Coconut	437.7	16.14	15.28	58.9
Flour Corn Yellow	363.7	6.2	1.74	80.8
Flour Oat Whole Grain	389.2	13.17	6.31	69.92
Flour Pastry Unenriched	358.6	8.75	1.64	77.2
Flour Pastry White	365.8	11.15	2.47	74.73
Flour Potato	360.8	8.11	0.95	79.94
Flour Quinoa	385.2	11.92	6.6	69.52
Flour Rice Brown	365.4	7.19	3.85	75.5
Flour Rice Glutenous	365.8	11.15	2.47	74.73
Flour Rice Glutinous	357.6	6.69	1.16	80.1
Flour Rice White	358.7	6.94	1.3	79.8
Flour Rye	359.4	8.4	1.91	77.16
Flour Semolina Coarse	365.8	11.15	2.47	74.73
Flour Semolina Coarse And Semi-Coarse	356.6	11.73	1.6	73.82
Flour Semolina Fine	357.8	13.33	1.84	71.99
Flour Semolina Semi-Coarse	365.8	11.15	2.47	74.73
Flour Sorghum	375.0	8.27	3.59	77.39
Flour Soy	365.8	11.15	2.47	74.73
Flour Soy Defatted	366.0	51.1	3.33	32.9
Flour Soy Full-Fat	452.3	38.6	20.7	27.9
Flour Spelt Whole Grain	363.7	14.48	2.54	70.72
Flour Wheat All-Purpose	366.1	10.9	1.48	77.3
Flour Whole Grain Oat	365.8	11.15	2.47	74.73
Flour Whole Wheat	365.8	11.15	2.47	74.73
Flour Whole Wheat Unenriched	369.8	15.1	2.73	71.2
Fluid Milk	42.8	3.38	0.95	5.19
Fluid With Added Vitamin A And Vitamin D Milk	34.0	3.43	0.08	4.89
Fonio Grain Dried	369.1	7.17	1.69	81.31
Frankfurter Beef Unheated	310.4	11.7	28.0	2.89
Fuji Apples	64.8	0.15	0.16	15.7
Gala Apples	61.1	0.13	0.15	14.8
Garlic	142.7	6.62	0.38	28.2
Gold Potatoes	73.4	1.81	0.26	15.96
Grade A Large White Egg	211.5	10.7	17.7	2.36
Grade A Large Whole Egg	143.1	12.4	9.96	0.96
Grade A Large Yolk Egg	328.1	16.2	28.8	1.02
Granny Smith Apples	59.1	0.27	0.14	14.2
Granulated	401.3	0.0	0.32	99.6
Grape Juice Purple	66.1	0.26	0.29	15.62
Grape Juice White	66.1	0.09	0.26	15.84
Grape Tomatoes	31.0	0.83	0.63	5.51
Grapefruit Juice Red	41.1	0.57	0.27	9.1
Grapefruit Juice White	38.9	0.55	0.7	7.59
Grapefruit Juice White Canned Or Bottled	38.9	0.55	0.7	7.59
Grapes Green Seedless	80.1	0.9	0.23	18.6
Grapes Red Seedless	85.9	0.91	0.16	20.2
Great Northern Canned Beans	116.9	7.03	1.27	19.33
Greek Plain Nonfat Yogurt	57.8	8.06	0.37	5.57
Greek Strawberry Yogurt	82.4	8.06	0.15	12.2
Greek Whole Milk Plain Yogurt	57.8	8.06	0.37	5.57
Greek Whole Milk Yogurt	93.6	8.78	4.39	4.75
Greek Yogurt	59.1	10.3	0.37	3.64
Green Beans	24.1	1.04	0.39	4.11
Green Onion (Scallion) Bulb And Greens	34.6	0.67	0.13	7.68
Green Sweet Peas	80.1	4.73	1.15	12.71
Ground Beef	189.2	18.16	12.85	0.22
Ground Chicken	136.1	17.91	7.16	0.0
Ground Flaxseed Meal	545.1	18.04	37.28	34.36
Ground Pork	228.6	17.81	17.49	0.0
Ground With Additives Chicken	136.1	17.91	7.16	0.0
Haddock	69.2	16.3	0.45	0.0
Halloumi	317.8	21.0	25.0	2.2
Ham Luncheon Meat	101.4	16.7	3.73	0.27
Ham Luncheon Meat Oscar Mayer Deli	101.4	16.7	3.73	0.27
Ham Sliced Pre-Packaged Deli Meat	101.4	16.7	3.73	0.27
Hazelnuts	641.4	13.49	53.49	26.5
Hon-Shimiji (Beech) White Mushrooms	37.6	2.65	0.28	6.12
Honeycrisp Apples	60.1	0.1	0.1	14.7
Hot Dogs Beef Ball Park Angus	101.4	16.7	3.73	0.27
Hot Dogs Beef Oscar Mayer Premium Jumbo	101.4	16.7	3.73	0.27
Hummus	242.9	7.35	17.1	14.9
Hummus Commercial	242.9	7.35	17.1	14.9
Hummus Sabra Classic	242.9	7.35	17.1	14.9
Hummus Tribe Classic	242.9	7.35	17.1	14.9
Italian Pork Sausage Johnsonville Hot	317.2	18.2	26.2	2.15
Italian Pork Sausage Johnsonville Mild	317.2	18.2	26.2	2.15
Juice Pomegranate	48.4	0.09	0.29	11.36
Juice Prune	49.7	0.42	0.29	11.36
Juice Prune Shelf-Stable	49.7	0.42	0.29	11.36
Juice Prune Water Extract Of Dried Prunes	49.7	0.42	0.29	11.36
Juice Tart Cherry	65.7	0.15	0.29	15.62
Kale	42.8	2.92	1.49	4.42
Kale Frozen	43.8	2.94	1.21	5.3
Kale Unprepared	43.3	2.93	1.35	4.86
Kefir Plain	51.2	3.5	2.0	4.8
Khorasan Grain Dried	371.4	14.76	2.8	71.79
Khorasan Grain Wheat Berry	371.4	14.76	2.8	71.79
Kidney Dark Red Beans	126.7	7.8	1.26	21.03
Kidney Light Red Beans	126.7	7.31	1.3	21.45
King Oyster Mushrooms	37.6	2.65	0.28	6.12
Kiwi	64.2	1.06	0.44	14.0
Kiwi (Kiwi) Green	65.1	1.01	0.64	13.82
Kiwi Green	64.2	1.06	0.44	14.0
Lamb Ground	236.6	17.46	18.64	-0.25
Leeks Bulb And Greens Root Removed	40.8	1.47	0.05	8.61
Lettuce Cos Or Romaine	20.3	1.24	0.26	3.24
Lettuce Iceberg	17.1	0.74	0.07	3.37
Lettuce Leaf Green	22.1	1.09	0.16	4.07
Lettuce Leaf Red	17.5	0.88	0.11	3.26
Lettuce Romaine	18.4	0.98	0.11	3.37
Lettuce Romaine Green	20.8	0.98	0.07	4.06
Lions Mane Mushrooms	37.6	2.65	0.28	6.12
Loin Pork	169.7	21.12	9.47	0.0
Loin Tenderloin Pork	121.4	21.58	3.9	0.0
Loin Tenderloin Roast Separable Beef	168.9	27.7	6.36	0.22
Macadamia Nuts	711.9	7.79	64.93	24.09
Maitake Mushrooms	37.6	2.65	0.28	6.12
Mandarin Seedless	62.0	1.04	0.46	13.42
Mango Ataulfo	78.5	0.69	0.68	17.4
Mango Tommy Atkins	68.4	0.56	0.57	15.26
Melons Cantaloupe	37.5	0.82	0.18	8.16
Melons Honeydew	36.7	0.53	0.22	8.15
Melons Honeydew Flesh Only	37.1	0.68	0.2	8.15
Milk	41.6	3.38	0.95	4.89
Millet Whole Grain	375.6	10.02	4.19	74.45
Monterey Jack Cheese Block	391.8	22.62	32.63	1.9
Monterey Jack Solid Cheese	391.8	22.62	32.63	1.9
Mozzarella Cheese Low-Moisture	296.2	23.7	20.4	4.44
Mozzarella Low Moisture Cheese	296.2	23.7	20.4	4.44
Mushroom Beech	39.8	2.18	0.45	6.76
Mushroom Crimini	30.2	3.09	0.2	4.01
Mushroom Enoki	44.4	2.42	0.24	8.14
Mushroom King Oyster	46.4	2.41	0.31	8.5
Mushroom Lion'S Mane	42.7	2.5	0.26	7.59
Mushroom Maitake	37.5	2.2	0.26	6.6
Mushroom Oyster	41.1	2.9	0.19	6.94
Mushroom Pioppini	39.2	3.5	0.24	5.76
Mushroom Portabella	32.4	2.75	0.31	4.66
Mustard Prepared Yellow	68.6	4.25	3.38	5.3
Navy Canned Beans	118.8	6.57	1.4	19.98
Nectarines	43.5	1.06	0.28	9.18
Nuts Almonds	663.3	15.37	57.61	20.84
Nuts Almonds Dried	666.6	20.4	57.8	16.2
Nuts Almonds Whole	625.7	21.45	51.09	20.03
Nuts Brazilnuts	663.6	15.04	57.43	21.64
Nuts Cashew Nuts	564.7	17.44	38.86	36.29
Nuts Hazelnuts Or Filberts	641.4	13.49	53.49	26.5
Nuts Macadamia Nuts	711.9	7.79	64.93	24.09
Nuts Pecans	663.3	15.37	57.61	20.84
Nuts Pecans Halves	750.2	9.96	73.28	12.7
Nuts Pine Nuts	688.6	15.7	61.27	18.59
Nuts Pistachio Nuts	598.0	20.51	45.02	27.69
Nuts Walnuts English	729.5	14.56	69.74	10.91
Oat Milk	48.3	0.8	2.75	5.1
Oatmeal Cookies With Raisins Pepperidge Farm Soft Baked	430.3	5.79	14.3	69.6
Oaxaca Cheese	321.0	22.62	24.3	2.96
Oaxaca Solid Cheese	297.1	22.14	22.1	2.4
Olive Oil Control Composite	900.0	0.0	100.0	0.0
Olive Oil Extra Light	900.0	0.0	100.0	0.0
Olive Oil Extra Virgin	900.0	0.0	100.0	0.0
Olives Green Manzanilla	140.5	1.15	12.9	4.96
Olives Green Manzanilla Stuffed With Pimentos Lindsay	140.5	1.15	12.9	4.96
Olives Green Manzanilla Stuffed With Pimentos Mario	140.5	1.15	12.9	4.96
Olives Green Manzanilla Stuffed With Pimentos Roland	140.5	1.15	12.9	4.96
Olives Green Manzanilla Stuffed With Pimentos Star	140.5	1.15	12.9	4.96
Onion Rings Breaded Par Fried	292.9	4.52	14.4	36.3
Onion Rings Frozen Oven-Heated	292.9	4.52	14.4	36.3
Onions Red	44.4	0.94	0.1	9.93
Onions White	35.4	0.89	0.13	7.68
Onions Yellow	38.2	0.83	0.05	8.61
Orange Juice	47.2	0.73	0.32	10.34
Oranges Navel	52.2	0.91	0.15	11.8
Oranges Navels	52.2	0.91	0.15	11.8
Overripe Bananas	85.3	0.73	0.22	20.1
Oyster Mushrooms	37.6	2.65	0.28	6.12
Parmesan Cheese Grated	420.0	29.6	28.0	12.4
Parmesan Grated Cheese	420.0	29.6	28.0	12.4
Pasteurized Process American Vitamin D Fortified Cheese	368.5	18.0	30.6	5.27
Pasteurized Process Cheese Food Or Product American Singles Cheese	309.8	15.57	23.86	8.19
Pawpaw	70.8	1.15	0.57	15.26
Peaches	46.5	0.91	0.27	10.1
Peaches Yellow	46.5	0.91	0.27	10.1
Peanut Butter Creamy	631.6	23.99	49.43	22.7
Peanut Butter Creamy Jif	635.3	23.25	50.26	22.5
Peanut Butter Creamy Skippy	635.3	23.25	50.26	22.5
Peanut Butter Smooth Style With Salt	639.1	22.5	51.1	22.3
Peanut Oil	900.0	0.0	100.0	0.0
Peanuts	588.3	23.2	43.28	26.5
Pear Anjou Green	63.6	0.31	0.37	14.77
Pears Bartlett	63.4	0.38	0.16	15.1
Pears Bartlett Regions 1 & 4	63.4	0.38	0.16	15.1
Pears Bartlett Regions 2 & 3	63.4	0.38	0.16	15.1
Pears Bosc	63.4	0.38	0.16	15.1
Pears Bosc Regions 1 & 4	63.4	0.38	0.16	15.1
Pears Bosc Regions 2 & 3	63.4	0.38	0.16	15.1
Pears Composite Of Green Cultivars	63.4	0.38	0.16	15.1
Pears Green Anjou	63.4	0.38	0.16	15.1
Pears Green Anjou Regions 1 & 4	63.4	0.38	0.16	15.1
Pears Green Anjou Regions 2 & 3	63.4	0.38	0.16	15.1
Pepperidge Farms	266.8	9.43	3.59	49.2
Peppers Bell Green	23.0	0.72	0.11	4.78
Peppers Bell Orange	31.8	0.88	0.16	6.7
Peppers Bell Red	31.4	0.9	0.13	6.65
Peppers Bell Yellow	30.8	0.82	0.12	6.6
Pickles Cucumber Dill Or Kosher Dill	13.8	0.48	0.43	1.99
Pickles Kosher Dill	13.8	0.48	0.43	1.99
Pickles Kosher Dill Spears	13.8	0.48	0.43	1.99
Pineapple	60.1	0.46	0.21	14.09
Pinto Canned Beans	116.6	6.69	1.27	19.6
Pioppini Mushrooms	37.6	2.65	0.28	6.12
Pistachio Nuts	598.0	20.51	45.02	27.69
Plantains Black Overripe	136.5	1.17	0.89	30.95
Plantains Green Unripe	136.5	1.17	0.89	30.95
Plantains Overripe	130.4	1.17	0.99	29.19
Plantains Ripe	136.4	1.16	0.89	30.95
Plantains Underripe	145.4	1.23	0.68	33.59
Plantains Yellow Ripe	136.5	1.17	0.89	30.95
Plum Black	58.7	0.58	0.28	13.46
Pollock	52.9	12.3	0.41	0.0
Portabella Mushrooms	37.6	2.65	0.28	6.12
Porterhouse Steak Beef	144.3	21.32	6.46	0.22
Provolone Cheese Sliced Non-Smoked	356.8	23.45	28.13	2.45
Provolone Cheese Sliced Smoked	356.8	23.45	28.13	2.45
Provolone Sliced Cheese	356.8	23.45	28.13	2.45
Pumpkin Seeds (Pepitas)	554.6	29.91	40.03	18.68
Pumpkin Seeds (Pepitas) Seeds	554.6	29.91	40.03	18.68
Queso Fresco Cheese	321.0	22.62	24.3	2.96
Queso Fresco Solid Cheese	297.6	18.88	23.36	2.96
Quinoa Flour	385.2	11.92	6.6	69.52
Raspberries	57.4	1.01	0.19	12.9
Red Delicious Apples	61.8	0.19	0.21	14.8
Red Lentils Dried	348.3	24.6	1.1	60.0
Red Potatoes	75.6	2.06	0.25	16.27
Red Unenriched Rice	369.8	8.56	3.44	76.15
Ribeye Steak Beef	144.3	21.32	6.46	0.22
Ricotta Whole Milk Cheese	157.7	7.81	11.0	6.86
Ripe And Slightly Ripe Bananas	97.6	0.74	0.29	23.0
Ripe Bananas	91.5	0.74	0.26	21.55
Ripe Extra Large Size Bananas	91.5	0.74	0.26	21.55
Rocket	31.5	2.6	0.7	3.7
Roma Tomatoes	27.0	0.85	0.45	4.9
Romaine Lettuce	18.4	0.98	0.11	3.37
Round Top Round Beef	140.6	21.48	5.7	0.85
Round Top Round Roast Beef	117.4	23.7	2.41	0.22
Russet Potatoes	83.4	2.27	0.36	17.77
Rutabaga	69.7	0.89	0.26	15.96
Rye Flour	359.4	8.4	1.91	77.16
Safflower Oil	900.0	0.0	100.0	0.0
Salmon	133.7	22.3	4.94	0.0
Salsa Pace Chunky	34.4	1.44	0.19	6.74
Salsa Pace Chunky Medium	34.4	1.44	0.19	6.74
Salsa Tostitos Chunky	34.4	1.44	0.19	6.74
Salsa Tostitos Chunky Medium	34.4	1.44	0.19	6.74
Salt Table Iodized	0.0	0.0	0.0	0.0
Sara Lee Soft And Smooth Classic Whole	266.8	9.43	3.59	49.2
Sauce Pasta Hunts Original	42.8	1.42	0.84	7.4
Sauce Pasta Prego 100% Natural Italian	42.8	1.42	0.84	7.4
Sauce Pasta Ragu Old World	42.8	1.42	0.84	7.4
Sauce Pasta Spaghetti/Marinara	51.2	1.41	1.48	8.05
Sauce Salsa Ready-To-Serve	34.4	1.44	0.19	6.74
Sausage Breakfast Sausage Beef Pre-	325.0	13.3	28.7	3.37
Sausage Italian Pork Mild	317.2	18.2	26.2	2.15
Sausage Pork Chorizo Link Or Ground	340.6	19.3	28.1	2.63
Sausage Turkey Breakfast Links Mild	164.1	16.7	10.4	0.93
Sea Bream	116.0	20.0	4.0	0.0
Sesame Butter Creamy	697.2	19.71	62.4	14.18
Sesame Seed Butter (Tahini) Creamy	697.2	19.71	62.4	14.18
Shallots Bulb	37.4	1.38	0.13	7.68
Shiitake Mushrooms	44.1	2.41	0.2	8.17
Short Loin (Ny Strip Steak) Beef	190.0	21.32	11.54	0.22
Short Loin Porterhouse Steak Separable Beef	139.6	22.7	5.32	0.22
Shrimp	71.4	15.57	0.8	0.48
Skim Milk	41.6	3.38	0.95	4.89
Skyr Plain	61.8	11.0	0.2	4.0
Slightly Ripe Bananas	91.5	0.74	0.26	21.55
Snap Canned Beans	185.0	23.6	1.26	19.81
Snap Green Beans	24.1	1.04	0.39	4.11
Sorghum Bran White Unenriched	402.8	11.17	9.26	68.7
Sorghum Flour	372.6	10.08	4.22	73.57
Sorghum Flour White Pearled	364.0	10.21	3.24	73.51
Sorghum Grain White Pearled	369.8	10.25	3.26	74.87
Sorghum Whole Grain White	372.6	10.08	4.22	73.57
Soy Milk	40.8	2.78	1.96	3.0
Soybean Oil	900.0	0.0	100.0	0.0
Spinach Baby	26.6	2.85	0.62	2.41
Spinach Mature	27.6	2.91	0.6	2.64
Spinach Regular	27.1	2.88	0.61	2.52
Squash Acorn	35.1	0.94	0.18	7.44
Squash Butternut	35.1	0.94	0.18	7.44
Squash Pie Pumpkin	34.8	0.85	0.18	7.44
Squash Spaghetti	34.5	0.79	0.18	7.44
Squash Summer Green	18.8	0.98	0.2	3.27
Squash Summer Yellow	22.4	0.89	0.14	4.39
Squash Winter Acorn	48.5	1.25	0.18	10.48
Squash Winter Butternut	48.2	1.15	0.17	10.51
Squash Yellow	35.1	0.94	0.18	7.44
Squash Zucchini	35.1	0.94	0.18	7.44
Strawberries	35.1	0.64	0.22	7.63
String (Low-Moisture Mozzarella) Cheese	321.0	22.62	24.3	2.96
Stroehmann Dutch County	253.6	12.3	3.55	43.1
Sugar Granulated White	401.3	0.0	0.32	99.6
Sunflower Oil	900.0	0.0	100.0	0.0
Sunflower Seed Kernel Seeds	609.4	18.87	48.44	24.5
Sunflower Seed Kernels	657.3	21.0	56.1	17.1
Sunflower Seed Kernels Dried Seeds	657.3	21.0	56.1	17.1
Sunflower Seeds Dried Salted	609.4	18.87	48.44	24.5
Sweet Potatoes Orange Flesh	79.1	1.58	0.38	17.33
Sweet Yellow And White Kernels Corn	84.6	2.79	1.63	14.69
Swiss Cheese	392.8	27.0	31.0	1.44
Swiss Slices Cheese	321.0	22.62	24.3	2.96
T-Bone Steak Beef	144.3	21.32	6.46	0.22
T-Bone Steak Lower Choice Beef	144.3	21.32	6.46	0.22
T-Bone Steak Upper Choice Beef	144.3	21.32	6.46	0.22
Tenderloin Pork	169.7	21.12	9.47	0.0
Tenderloin Roast Beef	144.3	21.32	6.46	0.22
Tenderloin Steak Beef	143.2	21.09	6.46	0.18
Tilapia	98.3	19.0	2.48	0.0
Tomatillos Dehusked	23.4	1.06	0.42	3.84
Tomato Juice	23.3	0.86	0.29	4.32
Tomato Juice With Added Ingredients	23.3	0.86	0.29	4.32
Tomato Paste Canned	104.2	4.23	0.73	20.19
Tomato Puree Canned	40.8	1.58	0.26	8.04
Tomato Roma	21.9	0.7	0.42	3.84
Tomato Sauce Canned	34.1	1.35	0.38	6.33
Top Loin Steak Beef	144.3	21.32	6.46	0.22
Top Loin Steak Choice Beef	144.3	21.32	6.46	0.22
Top Loin Steak Upper Choice Beef	144.3	21.32	6.46	0.22
Top Round Beef	144.3	21.32	6.46	0.22
Top Round Roast/Steak Beef	144.3	21.32	6.46	0.22
Top Sirloin Steak Beef	140.2	21.98	5.71	0.22
Tuna	84.8	19.0	0.94	0.08
Turkey Breakfast Sausage Butterball	164.1	16.7	10.4	0.93
Turkey Breakfast Sausage Hillshire Smoked	164.1	16.7	10.4	0.93
Turkey Breakfast Sausage Honeysuckle	164.1	16.7	10.4	0.93
Turkey Breakfast Sausage Honeysuckle White	164.1	16.7	10.4	0.93
Turkey Breakfast Sausage Jennie O	164.1	16.7	10.4	0.93
Turkey Breakfast Sausage Jimmy Dean	164.1	16.7	10.4	0.93
Turkey Ground	155.7	17.34	9.59	0.0
Unripe Extra Large Size Bananas	91.5	0.74	0.26	21.55
Unripe Medium Size Bananas	91.5	0.74	0.26	21.55
Vegetable Oil	900.0	0.0	100.0	0.0
White Button Mushrooms	31.2	2.89	0.37	4.08
White Commercially Prepared Bread	266.8	9.43	3.59	49.2
White Dried Egg	349.5	79.9	0.65	6.02
White Frozen Egg	44.8	10.1	0.16	0.74
White Long Grain Rice	358.7	7.04	1.03	80.31
White Rice Dry	354.7	7.1	0.7	80.0
White Rice Long Grain Unenriched	358.7	7.04	1.03	80.31
Whole 3. With Added Vitamin D Milk	60.6	3.28	3.2	4.67
Whole Canned Tomatoes	22.5	0.87	0.21	4.29
Whole Dried Egg	558.1	48.1	39.8	1.87
Whole Egg	225.8	15.6	17.7	1.02
Whole Frozen Egg	145.5	12.3	10.3	0.91
Whole Grain Rolled Oats	381.6	13.5	5.89	68.66
Whole Grain Steel Cut Oats	381.2	12.51	5.8	69.75
Whole Milk	41.6	3.38	0.95	4.89
Whole Milk Plain Yogurt	57.8	8.06	0.37	5.57
Whole Milk Yogurt	77.9	3.82	4.48	5.57
Whole Wheat Bread	253.6	12.3	3.55	43.1
Whole-Wheat Commercially Prepared Bread	253.6	12.3	3.55	43.1
Wild Rice Dried	369.1	12.79	1.7	75.67
Yogurt	50.0	4.23	0.09	8.08
Yolk Dried Egg	640.6	34.2	55.5	1.07
Yolk Frozen Egg	290.7	15.6	25.1	0.59`;

const rows = data.trim().split('\n');
const items = rows.map((line, idx) => {
    const parts = line.split('\t');
    const name = parts[0].replace(/'/g, "\\'");
    const calories = parseFloat(parts[1]);
    const protein = parseFloat(parts[2]);
    const fats = parseFloat(parts[3]);
    const carbs = parseFloat(parts[4]);
    return "  { id: 'import-" + (idx + 1) + "', name: '" + name + "', calories: " + calories + ", protein: " + protein + ", carbs: " + carbs + ", fats: " + fats + ", servingSize: '100g' }";
});

const foodItemsStr = items.join(',\n');

const libPath = 'c:/Users/usuario/Downloads/Nutrition_1-main/Nutrition_1-main/src/constants/library.ts';
let libContent = fs.readFileSync(libPath, 'utf-8');

const regex = /export const foodItems: FoodItem\[\] = \[[^]*?\];/;
const newStr = "export const foodItems: FoodItem[] = [\n" + foodItemsStr + "\n];";

libContent = libContent.replace(regex, newStr);
fs.writeFileSync(libPath, libContent);
console.log('Successfully written new dataset to library.ts');
