// import React, { useState } from "react";
// import { Link } from "react-router-dom";
import { Utensils, Clock, Truck } from 'lucide-react';
import Navbar from "./Navbar";
import Footer from "./Footer";

const HomePage = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const steps = [
    {
      icon: <Utensils className="w-12 h-12 text-orange-500" />,
      title: "Pick Meals",
      description: "Choose your meals from our diverse weekly menu."
    },
    {
      icon: <Clock className="w-12 h-12 text-orange-500" />,
      title: "Choose the Dates",
      description: "Select your preferred delivery schedule."
    },
    {
      icon: <Truck className="w-12 h-12 text-orange-500" />,
      title: "Fast Deliveries",
      description: "Get your meals delivered fresh to your door."
    }
  ];

  return (
    <div>
      <Navbar />

      <section className="pt-24 pb-12 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Favourite Food Delivered Hot & Fresh
              </h1>
              <p className="text-gray-600 mb-8">
                Healthy switched chef&apos;s do all the prep work, like peeling,
                chopping & marinating, so you can cook a fresh food.
              </p>
              <button
                onClick={() => scrollToSection("order")}
                className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors"
              >
                Order Now →
              </button>
            </div>
            <div className="relative">
              <img
                src="/images/food-bowl.jpg" // Make sure to add your image to the public/images folder
                alt="Fresh food bowl"
                className="rounded-full w-full h-auto"
                style={{
                  maxWidth: "600px",
                  maxHeight: "600px",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500 rounded-full opacity-20" />
      </section>

      <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We bring you the best possible meal experience with our simple three-step process
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

      <Footer />
    </div>
  );
};

export default HomePage;
