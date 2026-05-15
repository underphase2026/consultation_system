import React, { useState } from 'react';
import DaumPostcodeEmbed, { Address } from 'react-daum-postcode';
import axios from 'axios';

interface AddressData {
  postcode: string;
  roadAddress: string;
  jibunAddress: string;
  lat: number;
  lng: number;
}

interface StoreAddressSearchProps {
  onAddressSelect: (data: AddressData) => void;
}

/**
 * 매장 주소 검색 컴포넌트
 * react-daum-postcode를 사용하여 주소를 검색하고, 
 * 백엔드 API를 호출하여 위경도 좌표를 가져옵니다.
 */
const StoreAddressSearch: React.FC<StoreAddressSearchProps> = ({ onAddressSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: Address) => {
    setIsOpen(false);
    setLoading(true);
    setError(null);

    try {
      // 1. 선택된 주소 정보 추출
      const { zonecode: postcode, roadAddress, jibunAddress } = data;

      // 2. 백엔드 API 호출하여 위경도(Geocoding) 정보 획득
      // API_BASE_URL은 환경에 맞게 설정 필요 (예: http://localhost:3000/api)
      const response = await axios.get(`/stores/geocode`, {
        params: { address: roadAddress || jibunAddress },
      });

      const { lat, lng } = response.data;

      // 3. 부모 컴포넌트로 데이터 전달
      onAddressSelect({
        postcode,
        roadAddress,
        jibunAddress,
        lat,
        lng,
      });
    } catch (err: any) {
      console.error('주소 변환 오류:', err);
      setError('주소 좌표를 가져오는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-address-search">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">매장 주소</label>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          주소 찾기
        </button>

        {loading && <p className="text-sm text-gray-500">좌표를 계산하는 중...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">주소 검색</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">닫기</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[450px]">
              <DaumPostcodeEmbed onComplete={handleComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreAddressSearch;
