/**
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicKeyFormat } from '@sudoplatform/sudo-common'
import { KeyFormat } from '../../../../gen/graphqlTypes'

export class KeyFormatTransformer {
  fromEntityToGraphQL(format: PublicKeyFormat): KeyFormat {
    switch (format) {
      case PublicKeyFormat.SPKI:
        return 'SPKI'
      case PublicKeyFormat.RSAPublicKey:
        return 'RSA_PUBLIC_KEY'
    }
  }
}
