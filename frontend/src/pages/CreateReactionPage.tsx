import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

interface Metabolite {
    name: string;
    stoichiometry: string;
    compartment: string;
    type: string;
    verified: boolean;
}

type SetStateFunction = React.Dispatch<React.SetStateAction<Metabolite[]>>;

const CreateReactionPage = () => {
    const [skipAtomMapping, setSkipAtomMapping] = useState(false);
    const [substrates, setSubstrates] = useState<Metabolite[]>([{ name: '', stoichiometry: '1', compartment: 'C', type: 'VMH', verified: false }]);
    const [products, setProducts] = useState<Metabolite[]>([{ name: '', stoichiometry: '1', compartment: 'C', type: 'VMH', verified: false }]);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const compartments = ['C', 'M', 'Other'];
    const types = ['VMH', 'Custom'];

    const handleAddRow = (setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => [...prev, { name: '', stoichiometry: '1', compartment: 'C', type: 'VMH', verified: false }]);
    };

    const handleRemoveRow = (index: number, setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => prev.filter((_, i: number) => i !== index));
    };

    const handleVerify = (index: number, setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
            i === index ? { ...item, verified: true } : item
        ));
    };

    const handleInputChange = (index: number, field: keyof Metabolite, value: string, setState: SetStateFunction) => {
        setState((prev: Metabolite[]) => prev.map((item: Metabolite, i: number) =>
            i === index ? { ...item, [field]: value, verified: false } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResponse(null);

        try {
            const response = await axios.post('/api/reactions/create/', {
                substrates: substrates.map(({ name, stoichiometry, compartment, type }) => ({
                    name,
                    stoichiometry: parseFloat(stoichiometry),
                    compartment,
                    type
                })),
                products: products.map(({ name, stoichiometry, compartment, type }) => ({
                    name,
                    stoichiometry: parseFloat(stoichiometry),
                    compartment,
                    type
                })),
                direction: '->',
                skipAtomMapping,
                subsystem: 'Default',
                organ: 'Default'
            });

            setResponse(response.data);
        } catch (err) {
            const error = err as AxiosError;
            setError(error.response?.data?.toString() || 'An error occurred');
        }
    };

    const renderMetaboliteRow = (metabolite: Metabolite, index: number, setState: SetStateFunction, isSubstrate = true) => (
        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
            <input
                type="text"
                value={metabolite.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value, setState)}
                placeholder="Name"
                className="w-full sm:w-auto sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <input
                type="number"
                value={metabolite.stoichiometry}
                onChange={(e) => handleInputChange(index, 'stoichiometry', e.target.value, setState)}
                min="0"
                step="0.1"
                className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <select
                value={metabolite.compartment}
                onChange={(e) => handleInputChange(index, 'compartment', e.target.value, setState)}
                className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
                {compartments.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                ))}
            </select>
            <select
                value={metabolite.type}
                onChange={(e) => handleInputChange(index, 'type', e.target.value, setState)}
                className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
                {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <div className="flex gap-2 w-full sm:w-auto">
                <button
                    type="button"
                    onClick={() => handleVerify(index, setState)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:brightness-110 font-medium transition-all duration-200"
                >
                    Verify
                </button>
                {metabolite.verified && (
                    <span className="text-green-500 text-xl flex items-center">✓</span>
                )}
                <button
                    type="button"
                    onClick={() => handleRemoveRow(index, setState)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:brightness-110 font-medium transition-all duration-200"
                >
                    X
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Create Metabolic Reaction</h1>
                
                <div className="mb-8">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={skipAtomMapping}
                            onChange={(e) => setSkipAtomMapping(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-2"
                        />
                        <span className="text-gray-700 font-medium">Skip Atom Mapping (faster)</span>
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Substrates</h2>
                        {substrates.map((substrate, index) => 
                            renderMetaboliteRow(substrate, index, setSubstrates, true)
                        )}
                        <button
                            type="button"
                            onClick={() => handleAddRow(setSubstrates)}
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:brightness-110 font-medium transition-all duration-200"
                        >
                            + Add Substrate
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Products</h2>
                        {products.map((product, index) => 
                            renderMetaboliteRow(product, index, setProducts, false)
                        )}
                        <button
                            type="button"
                            onClick={() => handleAddRow(setProducts)}
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:brightness-110 font-medium transition-all duration-200"
                        >
                            + Add Product
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:brightness-110 font-medium text-lg transition-all duration-200"
                    >
                        Create Reaction
                    </button>
                </form>

                {error && (
                    <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-xl border border-red-200">
                        {JSON.stringify(error)}
                    </div>
                )}

                {response && (
                    <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Response:</h3>
                        <pre className="whitespace-pre-wrap text-gray-700">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateReactionPage; 