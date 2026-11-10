/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneNumberSearchEntity } from '../../domain/entities/phone-number-search/phoneNumberSearchEntity'
import {
  PhoneNumberSearchService,
  SearchAvailablePhoneNumbersInput,
} from '../../domain/entities/phone-number-search/phoneNumberSearchService'
import { ApiClient } from '../common/apiClient'
import { PhoneNumberSearchTransformer } from './transformer/phoneNumberSearchTransformer'

export class DefaultPhoneNumberSearchService implements PhoneNumberSearchService {
  private readonly phoneNumberSearchTransformer: PhoneNumberSearchTransformer

  constructor(private readonly appSync: ApiClient) {
    this.phoneNumberSearchTransformer = new PhoneNumberSearchTransformer()
  }

  async search(
    input: SearchAvailablePhoneNumbersInput,
  ): Promise<PhoneNumberSearchEntity> {
    const result = await this.appSync.searchAvailablePhoneNumbers({
      countryCode: input.countryCode,
      areaCode: input.areaCode,
      limit: input.limit,
    })
    return this.phoneNumberSearchTransformer.fromGraphQLToEntity(result)
  }
}
