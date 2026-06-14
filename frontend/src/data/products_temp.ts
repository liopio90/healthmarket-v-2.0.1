import { Product } from '../types/product';

export const products: Product[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjIyNzc1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Proteína Premium Whey',
    description: 'Proteína de suero de leche de alta calidad. Ideal para desarrollo muscular y recuperación post-entrenamiento.',
    price: '$49.99',
    rating: 4.9,
    badge: '¡Más Vendido!',
    category: 'Proteínas',
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjIyNzc1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1680265158261-5fd6ba5d9959?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwc2Nvb3B8ZW58MXx8fHwxNzYyMjA4Mjk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1701760211184-26fbb6d40389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29tYW4lMjBwcm90ZWluJTIwc2hha2V8ZW58MXx8fHwxNzYyMjAzNDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1666402667676-a273d65cdc42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwZmFjdHMlMjBsYWJlbHxlbnwxfHx8fDE3NjIzMDgzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    longDescription: 'Nuestra Proteína Premium Whey es la mejor opción para quienes buscan maximizar su desarrollo muscular y recuperación. Formulada con proteína de suero de leche aislada de la más alta calidad, proporciona 25g de proteína por porción con un perfil completo de aminoácidos esenciales, incluyendo 5.5g de BCAAs. Perfecta para tomar después del entrenamiento o en cualquier momento del día cuando necesites un impulso proteico.',
    benefits: [
      '25g de proteína de alta calidad por porción',
      'Rápida absorción para recuperación muscular',
      'Perfil completo de aminoácidos esenciales',
      '5.5g de BCAAs por porción',
      'Bajo en grasas y carbohidratos',
      'Sin azúcares añadidos',
      'Delicioso sabor a chocolate'
    ],
    ingredients: [
      'Concentrado de proteína de suero de leche',
      'Aislado de proteína de suero de leche',
      'Cacao en polvo',
      'Saborizantes naturales',
      'Stevia',
      'Lecitina de soja (emulsificante)',
      'Enzimas digestivas (lactasa, proteasa)'
    ],
    usage: 'Mezcla 1 scoop (30g) con 250-300ml de agua fría o leche. Toma 1-2 porciones al día, preferiblemente después del entrenamiento y/o entre comidas.',
    warnings: 'Contiene lácteos y soja. No exceder la dosis recomendada. Mantener fuera del alcance de los niños. Consulta con tu médico antes de usar si estás embarazada, amamantando o tienes alguna condición médica.',
    nutritionalInfo: {
      servingSize: '30g (1 scoop)',
      servingsPerContainer: 30,
      nutrients: [
        { name: 'Calorías', amount: '120 kcal' },
        { name: 'Proteína', amount: '25g', dailyValue: '50%' },
        { name: 'Carbohidratos', amount: '3g', dailyValue: '1%' },
        { name: 'Grasas', amount: '1.5g', dailyValue: '2%' },
        { name: 'BCAAs', amount: '5.5g', dailyValue: '*' },
        { name: 'Leucina', amount: '2.7g', dailyValue: '*' },
        { name: 'Isoleucina', amount: '1.5g', dailyValue: '*' },
        { name: 'Valina', amount: '1.3g', dailyValue: '*' }
      ]
    },
    reviews: [
      {
        id: 1,
        author: 'Carlos Méndez',
        rating: 5,
        date: '2025-10-15',
        comment: '¡Excelente proteína! El sabor es increíble y se mezcla muy bien. He notado una gran diferencia en mi recuperación muscular. Totalmente recomendada.',
        verified: true
      },
      {
        id: 2,
        author: 'María González',
        rating: 5,
        date: '2025-10-10',
        comment: 'La mejor proteína que he probado. No me cae pesada y el sabor a chocolate es delicioso. La tomo todos los días después de entrenar.',
        verified: true
      },
      {
        id: 3,
        author: 'Juan Ramírez',
        rating: 4,
        date: '2025-10-05',
        comment: 'Muy buena calidad, aunque el precio es un poco alto. De todas formas vale la pena por los resultados.',
        verified: true
      },
      {
        id: 4,
        author: 'Ana Martínez',
        rating: 5,
        date: '2025-09-28',
        comment: 'Perfecta para mis objetivos de fitness. Se disuelve fácilmente y el sabor es excelente. Ya voy por mi tercer envase.',
        verified: true
      }
    ]
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBib3R0bGV8ZW58MXx8fHwxNzYyMjUxMDI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Complejo Vitamínico ABC',
    description: 'Vitaminas esenciales para fortalecer tu sistema inmunológico y energía diaria.',
    price: '$29.99',
    rating: 4.7,
    badge: 'Nuevo',
    category: 'Vitaminas',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBib3R0bGV8ZW58MXx8fHwxNzYyMjUxMDI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    longDescription: 'Nuestro Complejo Vitamínico ABC combina las vitaminas esenciales A, B y C en una fórmula equilibrada diseñada para apoyar tu salud general. Fortalece tu sistema inmunológico, aumenta tu energía y mejora tu bienestar diario.',
    benefits: [
      'Fortalece el sistema inmunológico',
      'Aumenta los niveles de energía',
      'Mejora la salud de la piel',
      'Apoya la función cognitiva',
      'Antioxidantes potentes'
    ],
    usage: 'Toma 1 cápsula al día con alimentos.',
    stock: 200,
    category: 'Vitaminas'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1693996047034-311ab7656691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVnYSUyMDMlMjBzdXBwbGVtZW50c3xlbnwxfHx8fDE3NjIzMDc5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Omega-3 Premium',
    description: 'Aceite de pescado purificado rico en EPA y DHA para salud cardiovascular.',
    price: '$34.99',
    rating: 4.8,
    category: 'Omega-3',
    stock: 180,
    images: [
      'https://images.unsplash.com/photo-1693996047034-311ab7656691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVnYSUyMDMlMjBzdXBwbGVtZW50c3xlbnwxfHx8fDE3NjIzMDc5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    longDescription: 'Omega-3 Premium contiene aceite de pescado de alta pureza con concentraciones óptimas de EPA y DHA para apoyar la salud cardiovascular, cerebral y articular.',
    benefits: [
      'Apoya la salud cardiovascular',
      'Mejora la función cerebral',
      'Reduce la inflamación',
      'Apoya la salud articular',
      'Sin sabor a pescado'
    ],
    usage: 'Toma 2 cápsulas al día con alimentos.',
    stock: 180,
    category: 'Omega-3'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1674834727149-00812f907676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3VwcGxlbWVudHMlMjBneW18ZW58MXx8fHwxNzYyMjM5NDY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Pre-Workout Energía',
    description: 'Fórmula avanzada para maximizar tu rendimiento y energía en el gimnasio.',
    price: '$39.99',
    rating: 4.6,
    category: 'Pre-Workout',
    stock: 120,
    images: [
      'https://images.unsplash.com/photo-1674834727149-00812f907676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3VwcGxlbWVudHMlMjBneW18ZW58MXx8fHwxNzYyMjM5NDY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    longDescription: 'Pre-Workout Energía está formulado con ingredientes científicamente probados para aumentar tu energía, fuerza y concentración durante tus entrenamientos.',
    benefits: [
      'Aumenta la energía y resistencia',
      'Mejora la concentración',
      'Incrementa la fuerza muscular',
      'Reduce la fatiga',
      'Mejor bombeo muscular'
    ],
    usage: 'Mezcla 1 scoop con 250ml de agua 20-30 minutos antes de entrenar.',
    stock: 120,
    category: 'Pre-Workout'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjIyNzc1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Colágeno Hidrolizado',
    description: 'Mejora la salud de tu piel, cabello y articulaciones naturalmente.',
    price: '$44.99',
    rating: 4.9,
    category: 'Colágeno',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1693996045346-d0a9b9470909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjIyNzc1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    longDescription: 'Colágeno Hidrolizado de alta biodisponibilidad para mejorar la elasticidad de la piel, fortalecer el cabello y apoyar la salud articular.',
    benefits: [
      'Mejora la elasticidad de la piel',
      'Fortalece cabello y uñas',
      'Apoya la salud articular',
      'Reduce arrugas',
      'Fácil absorción'
    ],
    usage: 'Mezcla 1 scoop con tu bebida favorita una vez al día.',
    stock: 100,
    category: 'Colágeno'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBib3R0bGV8ZW58MXx8fHwxNzYyMjUxMDI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Multivitamínico Diario',
    description: 'Todas las vitaminas y minerales que necesitas en una sola cápsula.',
    price: '$24.99',
    rating: 4.5,
    category: 'Vitaminas',
    stock: 250,
    images: [
      'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwc3VwcGxlbWVudHMlMjBib3R0bGV8ZW58MXx8fHwxNzYyMjUxMDI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    longDescription: 'Multivitamínico completo con todas las vitaminas y minerales esenciales para apoyar tu salud general y llenar cualquier vacío nutricional en tu dieta.',
    benefits: [
      'Completo espectro de vitaminas',
      'Minerales esenciales',
      'Apoya la salud general',
      'Una sola cápsula al día',
      'Alta biodisponibilidad'
    ],
    usage: 'Toma 1 cápsula al día con alimentos.',
    stock: 250,
    category: 'Vitaminas'
  }
];
