
import React from 'react';
import { ProductProfile, Competitor, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { TrendingUp, TrendingDown, DollarSign, Activity, Droplet } from 'lucide-react';

interface Props {
  profile: ProductProfile;
  competitors: Competitor[];
  language: Language;
}

// Helper type to handle the union of ProductProfile and Competitor properties
type MergedProduct = Partial<ProductProfile> & Partial<Competitor> & {
  isMain: boolean;
  name: string;
};

export const CompetitorComparison: React.FC<Props> = ({ profile, competitors, language }) => {
  const t = TRANSLATIONS[language];

  const parseValue = (str: string | undefined): number => {
    if (!str) return 0;
    // Extract first number found
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const getUnit = (str: string): string => {
    if (!str) return '';
    const match = str.match(/[a-zA-Z%]+/);
    return match ? match[0] : '';
  };

  // Prepare data for comparison
  const allProducts: MergedProduct[] = [
    { ...profile, name: profile.name || t.sections.profile, isMain: true },
    ...competitors.map(c => ({ ...c, isMain: false }))
  ];

  // Metrics to compare
  const metrics = [
    { 
      key: 'price', 
      label: t.tableHeaders.price, 
      getValue: (p: any) => parseValue(p.price || p.pricePer100g),
      getDisplay: (p: any) => p.price || p.pricePer100g,
      color: 'bg-green-500',
      icon: <DollarSign className="w-4 h-4 text-green-600" />
    },
    { 
      key: 'energy', 
      label: 'Energy', 
      subLabel: '(kcal/100g)',
      getValue: (p: any) => parseValue(p.nutrition?.energy || p.specs?.energy),
      getDisplay: (p: any) => p.nutrition?.energy || p.specs?.energy,
      color: 'bg-blue-500',
      icon: <Activity className="w-4 h-4 text-blue-600" />
    },
    { 
      key: 'sugar', 
      label: 'Sugar',
      subLabel: '(g/100g)',
      getValue: (p: any) => parseValue(p.nutrition?.sugar),
      getDisplay: (p: any) => p.nutrition?.sugar,
      color: 'bg-pink-500',
      icon: <Droplet className="w-4 h-4 text-pink-600" />
    },
    { 
      key: 'fat', 
      label: 'Fat',
      subLabel: '(g/100g)',
      getValue: (p: any) => parseValue(p.nutrition?.fat),
      getDisplay: (p: any) => p.nutrition?.fat,
      color: 'bg-yellow-500',
      icon: <Droplet className="w-4 h-4 text-yellow-600" />
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">{t.sections.benchmark}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 w-1/4">Feature</th>
              {allProducts.map((p, idx) => (
                <th key={idx} className={`text-left py-4 px-4 text-sm font-semibold ${p.isMain ? 'text-pink-600 bg-pink-50' : 'text-gray-700'} w-1/5`}>
                  <div className="flex flex-col">
                    <span className="line-clamp-2">{p.name}</span>
                    {p.isMain && <span className="text-xs font-normal text-pink-500 mt-1">(This Product)</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* USP Row */}
            <tr>
              <td className="py-4 px-6 text-sm font-medium text-gray-600">{t.tableHeaders.usp}</td>
              {allProducts.map((p, idx) => (
                <td key={idx} className={`py-4 px-4 text-sm ${p.isMain ? 'bg-pink-50/30' : ''}`}>
                   <p className="text-gray-600 text-xs leading-relaxed">{p.usp || (p.isMain ? 'N/A' : '')}</p>
                </td>
              ))}
            </tr>

            {/* Visual Metric Rows */}
            {metrics.map((metric) => {
              // Find max value for this metric to calculate bar width
              const maxValue = Math.max(...allProducts.map(p => metric.getValue(p)));
              
              return (
                <tr key={metric.key}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                        {metric.subLabel && <span className="text-xs text-gray-400">{metric.subLabel}</span>}
                      </div>
                    </div>
                  </td>
                  {allProducts.map((p, idx) => {
                    const val = metric.getValue(p);
                    const displayVal = metric.getDisplay(p);
                    const percent = maxValue > 0 ? (val / maxValue) * 100 : 0;

                    return (
                      <td key={idx} className={`py-4 px-4 align-top ${p.isMain ? 'bg-pink-50/30' : ''}`}>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-800">{displayVal || '-'}</span>
                          {val > 0 && (
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${metric.color} transition-all duration-500`} 
                                style={{ width: `${percent}%` }} 
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Sensory Text Row */}
            <tr>
              <td className="py-4 px-6 text-sm font-medium text-gray-600">{t.tableHeaders.sensory}</td>
              {allProducts.map((p, idx) => (
                <td key={idx} className={`py-4 px-4 text-sm ${p.isMain ? 'bg-pink-50/30' : ''}`}>
                   <div className="flex flex-col gap-1 text-xs text-gray-600">
                     {p.sensory ? Object.entries(p.sensory).map(([k, v]) => (
                       <div key={k}><span className="capitalize font-medium">{k}:</span> {v as string}</div>
                     )) : (p.specs ? 
                        <>
                          <div><span className="font-medium">Texture:</span> {p.specs.texture}</div>
                          <div><span className="font-medium">Flavor:</span> {p.specs.flavorProfile}</div>
                        </> : '-'
                     )}
                   </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
