-- Create Restaurants table
CREATE TABLE Restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    opinion FLOAT,
    verified BOOLEAN,
    cuisine_type TEXT,
    coordinates POINT,
    coordinates_to_verify POINT,
    coordinates_verified BOOLEAN
);

-- Create Dishes table
CREATE TABLE Dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    calories INT,
    price FLOAT,
    weight FLOAT
);

-- Create Restaurants_Dishes table (many-to-many relationship)
CREATE TABLE Restaurants_Dishes (
    id_dish INT NOT NULL,
    id_restaurant INT NOT NULL,
    verified BOOLEAN,
    PRIMARY KEY (id_dish, id_restaurant),
    FOREIGN KEY (id_dish) REFERENCES Dishes(id),
    FOREIGN KEY (id_restaurant) REFERENCES Restaurants(id)
);

-- Create Allergens table
CREATE TABLE Allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Create Ingredients table
CREATE TABLE Ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    vegetarian BOOLEAN,
    vegan BOOLEAN
);

-- Create Allergens_Ingredients table (many-to-many relationship)
CREATE TABLE Allergens_Ingredients (
    id_allergen INT NOT NULL,
    id_ingredient INT NOT NULL,
    PRIMARY KEY (id_allergen, id_ingredient),
    FOREIGN KEY (id_allergen) REFERENCES Allergens(id),
    FOREIGN KEY (id_ingredient) REFERENCES Ingredients(id)
);

-- Create Ingredients_Dishes table (many-to-many relationship)
CREATE TABLE Ingredients_Dishes (
    id_ingredient INT NOT NULL,
    id_dish INT NOT NULL,
    PRIMARY KEY (id_ingredient, id_dish),
    FOREIGN KEY (id_ingredient) REFERENCES Ingredients(id),
    FOREIGN KEY (id_dish) REFERENCES Dishes(id)
);

-- Create Users table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN
);

-- Create Comments table
CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment TEXT NOT NULL,
    verified BOOLEAN,
    score FLOAT
);

-- Create Restaurants_Comments table (many-to-many relationship)
CREATE TABLE Restaurants_Comments (
    id_restaurant INT NOT NULL,
    id_comment INT NOT NULL,
    PRIMARY KEY (id_restaurant, id_comment),
    FOREIGN KEY (id_restaurant) REFERENCES Restaurants(id),
    FOREIGN KEY (id_comment) REFERENCES Comments(id)
);